const Dashboard = () => {
  const handleLogout = () => {
    localStorage.clear(); 
    window.location.href = '/'; 
  };

  return (
    <div>
      <h1>Halaman Dashboard</h1>
      <button onClick={handleLogout} style={{ color: 'red' }}>
        Logout / Buang Token
      </button>
    </div>
  );
};

export default Dashboard;