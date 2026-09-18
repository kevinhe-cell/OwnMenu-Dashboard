import swal from "sweetalert";

function NotiSweetAler() {
  return (
    <div className="col-xl-3 col-xxl-4 col-lg-4 col-md-6">
      <div className="card">
        <div className="card-body">
          <h4 className="card-title">Sweet Success</h4>
          <div className="card-content">
            <div className="sweetalert mt-5">
              <button
                onClick={() =>
                  swal("Good job!", "You clicked the button!", "success")
                }
                className="btn btn-success btn sweet-success"
              >
                Sweet Success
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotiSweetAler;
