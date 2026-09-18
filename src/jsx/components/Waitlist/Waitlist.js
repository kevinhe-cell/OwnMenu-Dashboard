import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Pagination, Modal, Row, Col, Table } from "react-bootstrap";
import { getWaitlistsThunk } from "../../../store/waitlists";

function Waitlist() {
  const dispatch = useDispatch();
  const waitlist = useSelector((state) => state.waitlists.waitlists);
  const id = useSelector((state) => state.session.user.id);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(getWaitlistsThunk(id, currentPage));
  }, [dispatch, id, currentPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to the top of the page
  };

  // Function to format the date as '2/14/24'
  const formatDate = (date) => {
    const formattedDate = new Date(date);
    return `${formattedDate.getMonth() + 1}/${formattedDate.getDate()}/${formattedDate.getFullYear()}`;
  };

  return (
    <div className="container">
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">ALL Waitlist</h5>
          <Table responsive striped bordered hover>
            <thead>
              <tr>
                <th>#Line ID</th>
                <th>Joined Time</th>
                <th>Customer Info</th>
                <th>PartySize</th>
                <th>Seated</th>
                <th>WaitTime</th>
              </tr>
            </thead>
            <tbody>
              {waitlist?.map((list, index) => (
                <React.Fragment key={list.id}>
                  {index > 0 &&
                    formatDate(list?.createdAt) !==
                      formatDate(waitlist[index - 1]?.createdAt) && (
                      <tr className="text-center">
                        <td colSpan="5">
                          <strong>{formatDate(list?.createdAt)}</strong>
                        </td>
                      </tr>
                    )}
                  <tr
                    key={list.id}
                    style={{
                      cursor: "pointer",
                      fontSize: "16px",
                      lineHeight: "1.1rem",
                    }}
                  >
                    <td>#{list.id}</td>
                    <td>
                      {new Date(list?.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td>
                      <p>
                        Name: {list.name}
                        <br />
                        Phone: {list.phone}
                      </p>
                    </td>
                    <td>{list.party_size}</td>
                    <td>{list.seated ? "Yes" : "No"}</td>
                    <td>{list.wait_time} Min</td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </Table>
          <div className="d-flex justify-content-center">
            <Pagination>
              <Pagination.Prev
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              />
              <Pagination.Item>{currentPage}</Pagination.Item>
              <Pagination.Next
                onClick={() => handlePageChange(currentPage + 1)}
              />
            </Pagination>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Waitlist;
