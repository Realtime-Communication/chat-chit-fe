import React, { useEffect, useState } from "react";
import { acceptFriendRequest, rejectFriendRequest, cancelFriendRequest, getAllFriends, unfriend } from "../../../api/User.api";
import user from "../../store/accountContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Friend {
  id: number;
  requesterId: number;
  receiverId: number;
  status: "ACCEPTED" | "PENDING" | "REJECTED";
  createdAt: string;
  requester: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
  };
  receiver: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
  };
}

interface PaginationMeta {
  page: number;
  size: number;
  totalPage: number;
  totalElement: number;
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

type FriendsResponse = ApiResponse<{
  result: Friend[];
} & PaginationMeta>;

const FriendPage: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<{
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
  }>({
    currentPage: 1,
    pageSize: 4, // Default to 4 items per page as per the example
    totalPages: 1,
    totalElements: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFields, setSearchFields] = useState<string[]>(["firstName", "lastName", "email"]);
  const [order, setOrder] = useState("desc");
  const [statusFilter, setStatusFilter] = useState<"ACCEPTED" | "PENDING" | "REJECTED">("ACCEPTED");

  const currentUser = user;

  // Get the other friend from friendship data
  const getOtherFriend = (friendship: Friend) => {
    if (friendship.requester.id === currentUser.id) {
      return friendship.receiver;
    } else {
      return friendship.requester;
    }
  };

  // Get friendship status for display
  const getFriendshipStatus = (friendship: Friend) => {
    if (friendship.status === "ACCEPTED") {
      return "Friend";
    } else if (friendship.status === "PENDING") {
      if (friendship.requester.id === currentUser.id) {
        return "Request Sent";
      } else {
        return "Request Received";
      }
    } else {
      return "Rejected";
    }
  };

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const response: FriendsResponse = await getAllFriends(
        order,
        pagination.currentPage,
        pagination.pageSize,
        searchTerm,
        searchFields,
        // statusFilter
      );
      
      // Filter friends based on status filter
      const filteredFriends = response.data.result?.filter(friend => {
        // If status filter is set to 'ACCEPTED', only show accepted friends where current user is either requester or receiver
        if (statusFilter === 'ACCEPTED') {
          return friend.status === 'ACCEPTED' && 
                 (friend.requester.id === currentUser.id || friend.receiver.id === currentUser.id);
        }
        // For other statuses, check if the current user is the receiver for incoming requests
        // or the requester for outgoing requests
        return friend.status === statusFilter && 
               ((statusFilter === 'PENDING' && friend.receiver.id === currentUser.id) || // Incoming requests
                (statusFilter === 'REJECTED' && friend.receiver.id === currentUser.id) || // Rejected requests
                (friend.requester.id === currentUser.id)); // Outgoing requests
      }) || [];

      setFriends(filteredFriends);
      setPagination(prev => ({
        ...prev,
        totalPages: Math.ceil(filteredFriends.length / pagination.pageSize) || 1,
        totalElements: filteredFriends.length
      }));
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, [pagination.currentPage, pagination.pageSize, searchTerm, order, statusFilter]);

  const { currentPage, pageSize, totalPages, totalElements } = pagination;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({
      ...prev,
      currentPage: 1 // Reset to first page when searching
    }));
    fetchFriends();
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
  };

  const handlePageSizeChange = (newSize: number) => {
    setPagination({
      currentPage: 1, // Reset to first page when changing page size
      pageSize: newSize,
      totalPages: Math.ceil(pagination.totalElements / newSize),
      totalElements: pagination.totalElements
    });
  };

  const handleOrderChange = (newOrder: string) => {
    setOrder(newOrder);
    setPagination(prev => ({
      ...prev,
      currentPage: 1 // Reset to first page when changing order
    }));
  };

  const handleSearchFieldToggle = (field: string) => {
    setSearchFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
    // Reset to first page when changing search fields
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };

  const handleFriendAction = async (friendshipId: number, action: 'accept' | 'reject' | 'cancel' | 'unfriend', friendId?: number) => {
    try {
      let response;
      switch (action) {
        case 'accept':
          response = await acceptFriendRequest(friendshipId);
          break;
        case 'reject':
          response = await rejectFriendRequest(friendshipId);
          break;
        case 'cancel':
          response = await cancelFriendRequest(friendshipId);
          break;
        case 'unfriend':
          if (!friendId) throw new Error('Friend ID is required for unfriending');
          response = await unfriend(friendId);
          break;
      }

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(`Friend request ${action}ed successfully`);
        fetchFriends(); // Refresh the list
      } else {
        throw new Error(response.message || `Failed to ${action} friend request`);
      }
    } catch (error: any) {
      console.error(`Error ${action}ing friend request:`, error);
      toast.error(error?.message || `Failed to ${action} friend request`);
    }
  };

  const renderFriendActions = (friendship: Friend) => {
    const isCurrentUserRequester = friendship.requester.id === currentUser.id;
    const otherFriend = friendship.requester.id === currentUser.id 
      ? friendship.receiver 
      : friendship.requester;
    
    const statusText = friendship.status === 'ACCEPTED' ? 'Friends' : 
                       friendship.status === 'PENDING' ? 'Pending' : 'Rejected';
    
    const statusClass = {
      'ACCEPTED': 'text-green-600 bg-green-50',
      'PENDING': 'text-yellow-600 bg-yellow-50',
      'REJECTED': 'text-gray-500 bg-gray-100'
    }[friendship.status] || '';

    return (
      <div className="flex flex-col items-end gap-2 min-w-[120px]">
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-sm rounded-full text-center ${statusClass}`}>
            {statusText}
          </span>
          {friendship.status === 'ACCEPTED' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleFriendAction(friendship.id, 'unfriend', otherFriend.id);
              }}
              className="text-red-500 hover:text-red-700 transition-colors"
              title="Unfriend"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        {friendship.status === 'PENDING' && !isCurrentUserRequester && (
          <div className="flex gap-2 w-full">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleFriendAction(friendship.id, 'accept');
              }}
              className="flex-1 px-2 py-1 text-xs text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors whitespace-nowrap"
            >
              Accept
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleFriendAction(friendship.id, 'reject');
              }}
              className="flex-1 px-2 py-1 text-xs text-red-600 bg-red-50 rounded-full hover:bg-red-100 transition-colors whitespace-nowrap"
            >
              Reject
            </button>
          </div>
        )}
        {friendship.status === 'PENDING' && isCurrentUserRequester && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFriendAction(friendship.id, 'cancel');
            }}
            className="w-full px-2 py-1 text-xs text-red-600 bg-red-50 rounded-full hover:bg-red-100 transition-colors whitespace-nowrap"
          >
            Cancel Request
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="w-full max-w-4xl mx-auto p-2 sm:p-6">
      <div className="bg-white rounded-2xl shadow-md p-4 sm:p-8">
        <h2 className="text-2xl font-bold text-[#0088cc] mb-6 text-center">
          Friends
        </h2>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search friends..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088cc]"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={order}
                onChange={(e) => handleOrderChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088cc]"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "ACCEPTED" | "PENDING" | "REJECTED")}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088cc] min-w-[140px]"
              >
                <option value="ACCEPTED">Friends</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <button
                type="submit"
                className="px-6 py-2 bg-[#0088cc] hover:bg-[#007ab8] text-white rounded-lg font-medium transition"
              >
                Search
              </button>
            </div>
          </div>

          {/* Search Fields */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Search in:</span>
            {["firstName", "lastName", "email"].map((field) => (
              <label key={field} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={searchFields.includes(field)}
                  onChange={() => handleSearchFieldToggle(field)}
                  className="rounded"
                />
                <span className="text-sm capitalize">{field}</span>
              </label>
            ))}
          </div>
        </form>

        {/* Results Summary */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {friends.length} of {pagination.totalElements} friends (Page {pagination.currentPage} of {pagination.totalPages})
        </div>

        {/* Friends List */}
        {loading ? (
          <div className="text-center text-gray-400 py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0088cc] mx-auto mb-2"></div>
            Loading...
          </div>
        ) : friends.length === 0 ? (
          <div className="text-center text-gray-400 py-10">No friends found.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {friends.map((friendship) => {
              const otherFriend = getOtherFriend(friendship);
              const status = getFriendshipStatus(friendship);
              
              return (
                <li
                  key={friendship.id}
                  className="flex items-start gap-4 p-4 hover:bg-[#f7f8fa] transition rounded-xl"
                >
                  <div className="flex-shrink-0">
                    <img
                      src={"/user/friend.png"}
                      alt="avatar"
                      className="w-12 h-12 rounded-full border-2 border-[#e3f2fd] object-cover"
                    />
                    <div className="flex justify-center mt-1">
                      <span className={`w-2 h-2 rounded-full ${
                        otherFriend.isActive ? 'bg-[#4fbc6b]' : 'bg-gray-400'
                      }`}></span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-[#0088cc]">
                        {otherFriend.firstName} {otherFriend.lastName}
                      </div>
                    </div>
                    <div className="text-gray-500 text-sm">
                      @{otherFriend.lastName || "unknown"}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {otherFriend.email}
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      Since: {new Date(friendship.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {renderFriendActions(friendship)}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} • {pagination.totalElements} total items
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="First page"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Previous</span>
                </button>
                
                {/* Page Numbers */}
                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page: number;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    
                    if (page < 1 || page > totalPages) return null;
                    
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 flex items-center justify-center text-sm rounded-lg transition-colors ${
                          page === currentPage
                            ? 'bg-[#0088cc] text-white border border-[#0088cc] font-medium'
                            : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                        }`}
                        aria-current={page === currentPage ? 'page' : undefined}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                <div className="sm:hidden text-sm font-medium">
                  {currentPage} / {totalPages}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <span>Next</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Last page"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Items per page:</span>
                <select
                  value={pagination.pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088cc]"
                >
                  <option value={4}>4</option>
                  <option value={8}>8</option>
                  <option value={12}>12</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default FriendPage;
