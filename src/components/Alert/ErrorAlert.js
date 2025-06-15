const ErrorAlert = ({ value }) => {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow transition duration-300 animate-fade-in-out">
      <strong className="font-bold">{value[0]}</strong>
      <p className="text-sm">{value[1]}</p>
    </div>
  );
};

export default ErrorAlert;
