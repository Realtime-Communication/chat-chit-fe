import React, { useState, useEffect } from 'react';
import './AddParticipant.scss';
import { AddParticipantProps, FriendAP } from '../../../../api/User.int';
import { addParticipantToConversation, fetchFriendAddParticipant } from '../../../../api/User.api';


export const AddParticipant: React.FC<AddParticipantProps> = ({
  conversationId,
  onParticipantAdded,
  onClose,
}) => {
  const [friends, setFriends] = useState<FriendAP[]>([]);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const data = await fetchFriendAddParticipant();
      if (data.statusCode === 200) {
        const acceptedFriends = data.data.result.filter(
          (friend: FriendAP) => friend.status === 'ACCEPTED'
        );
        setFriends(acceptedFriends);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
      setError('Failed to load friends');
    }
  };

  const handleAddParticipant = async () => {
    if (!selectedEmail) {
      setError('Please select a friend or enter an email');
      return;
    }

    setLoading(true);
    setError('');

    const body = {
      email: selectedEmail,
      type: 'MEMBER'
    };

    try {
      const data = await addParticipantToConversation(conversationId, body);
      if (data.statusCode === 201) {
        onParticipantAdded();
        onClose();
      } else {
        setError(data.message || 'Failed to add participant');
      }
    } catch (error) {
      console.error('Error adding participant:', error);
      setError('Failed to add participant');
    } finally {
      setLoading(false);
    }
  };

  const handleFriendSelect = (email: string) => {
    setSelectedEmail(email);
    setError('');
  };

  return (
    <div className="add-participant-modal">
      <div className="modal-header">
        <h3>Add Participant</h3>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      <div className="modal-content">
        <div className="search-section">
          <input
            type="email"
            placeholder="Enter email address"
            value={selectedEmail}
            onChange={(e) => setSelectedEmail(e.target.value)}
            className="email-input"
          />
          <button
            className="add-button"
            onClick={handleAddParticipant}
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Participant'}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="friends-section">
          <h4>Your Friends</h4>
          <div className="friends-list">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className={`friend-item ${selectedEmail === friend.requester.email ? 'selected' : ''}`}
                onClick={() => handleFriendSelect(friend.requester.email)}
              >
                <div className="friend-info">
                  <span className="friend-name">
                    {friend.requester.first_name} {friend.requester.last_name}
                  </span>
                  <span className="friend-email">{friend.requester.email}</span>
                </div>
                <div className="friend-status">
                  {selectedEmail === friend.requester.email && '✓'}
                </div>
              </div>
            ))}
            {friends.length === 0 && (
              <div className="no-friends">No friends available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddParticipant; 
