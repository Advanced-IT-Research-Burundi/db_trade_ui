
  const StatCard = ({ icon, title, value, color, loading }) => (
    <div className="col-xl-3 col-md-6 mb-3">
      <div className="card h-100 shadow-sm border-0">
        <div className="card-body">
          <div className="d-flex align-items-center">
            <div className="flex-shrink-0">
              <div className={`bg-${color} bg-opacity-10 p-3 rounded-circle`}>
                <i className={`pi pi-${icon} text-${color} fs-4`}></i>
              </div>
            </div>
            <div className="flex-grow-1 ms-3">
              <h6 className="text-muted mb-1">{title}</h6>
              {loading ? (
                <div className="placeholder-glow">
                  <span className="placeholder col-8"></span>
                </div>
              ) : (
                <h4 className="mb-0">{value}</h4>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  export default StatCard