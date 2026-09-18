import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Modal, Button, Carousel, Badge, Card, Spinner } from "react-bootstrap";
import swal from "sweetalert";
import { useDispatch } from "react-redux";
import { deleteFacebookDraftThunk } from "../../../store/facebook";

import { useTranslation } from "react-i18next";

const localizer = momentLocalizer(moment);

export default function FacebookDraftList({ drafts = [] }) {
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [events, setEvents] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    const formatted = drafts.map((draft) => ({
      id: draft.id,
      title: draft.status === "published" ? t("marketing.draft_list.published_post") : t("marketing.draft_list.scheduled_post"),
      start: new Date(draft.delivery_date),
      end: new Date(draft.delivery_date),
      allDay: false,
      draft,
    }));
    setEvents(formatted);
  }, [drafts]);

  const eventStyleGetter = (event) => {
    const isPublished = event?.draft?.status === "published";
    return {
      style: {
        backgroundColor: isPublished ? "#16a34a" : "#dd2f6e",
        color: "white",
        borderRadius: "6px",
        border: "none",
        padding: "4px 8px",
        fontWeight: "500",
      },
    };
  };

  const handleDelete = async () => {
    const confirmed = await swal({
      title: t("marketing.draft_list.swal_delete_title"),
      text: t("marketing.draft_list.swal_delete_text"),
      icon: "warning",
      buttons: [t("common.cancel"), t("common.delete")],
      dangerMode: true,
    });

    if (!confirmed || !selectedDraft) return;

    try {
      setDeleting(true);
      await dispatch(deleteFacebookDraftThunk(selectedDraft.id));
      setSelectedDraft(null);
      swal(t("marketing.draft_list.swal_deleted_title"), t("marketing.draft_list.swal_deleted_text"), "success");
    } catch (err) {
      swal(t("common.error"), err.message || t("common.failed"), "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="container py-4 shadow-sm border-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">{t("marketing.draft_list.title_fb")}</h3>
        <p className="text-muted mb-0">
          {t("marketing.draft_list.desc_fb")}
        </p>
      </div>

      {drafts.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted">{t("marketing.draft_list.no_posts_fb")}</p>
        </div>
      ) : (
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          onSelectEvent={(e) => setSelectedDraft(e.draft)}
          views={["month", "day"]}
          popup
          defaultView="month"
          eventPropGetter={eventStyleGetter}
          className="mb-5 border rounded shadow-sm p-3 calendar-view"
        />
      )}

      <Modal
        show={!!selectedDraft}
        onHide={() => setSelectedDraft(null)}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-semibold">{t("marketing.draft_list.modal_details_title")}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedDraft && (
            <>
              <Carousel interval={null} className="mb-4 border rounded overflow-hidden">
                {JSON.parse(selectedDraft.media_url || "[]").map((url, index) => {
                  const isVideo = /\.(mp4|mov|webm|avi|mkv)$/i.test(url);
                  return (
                    <Carousel.Item key={index}>
                      {isVideo ? (
                        <video
                          className="d-block w-100"
                          src={url}
                          controls
                          style={{ objectFit: "cover", maxHeight: 400 }}
                        />
                      ) : (
                        <img
                          className="d-block w-100"
                          src={url}
                          alt={`media-${index}`}
                          style={{ objectFit: "cover", maxHeight: 400 }}
                        />
                      )}
                    </Carousel.Item>
                  );
                })}
              </Carousel>
              <h5 className="fw-bold mb-2">
                {moment(selectedDraft.delivery_date).format(
                  "dddd, MMMM Do YYYY • h:mm A",
                )}
              </h5>
              <p className="mb-3 fs-6 text-secondary">
                {selectedDraft.caption || (
                  <em className="text-muted">{t("marketing.draft_list.no_caption_fb")}</em>
                )}
              </p>
              <div className="d-flex flex-wrap gap-2">
                <Badge
                  bg={selectedDraft.status === "published" ? "success" : "info"}
                  className="px-3 py-2"
                >
                  {selectedDraft.status === "published" ? t("marketing.draft_list.status_published") : t("marketing.draft_list.status_scheduled")}
                </Badge>
                <Badge bg="primary" className="px-3 py-2">
                  {selectedDraft.created_by === "AI" ? "AI" : t("common.manual")}
                </Badge>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 d-flex justify-content-between">
          {selectedDraft?.status !== "published" && (
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? (
                <Spinner animation="border" size="sm" className="me-2" />
              ) : (
                t("common.delete")
              )}
            </Button>
          )}
          <Button variant="outline-secondary" onClick={() => setSelectedDraft(null)}>
            {t("marketing.draft_list.close_btn")}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
}
