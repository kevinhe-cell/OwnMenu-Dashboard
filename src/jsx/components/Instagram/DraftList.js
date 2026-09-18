import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Modal, Button, Carousel, Badge, Card, Spinner } from "react-bootstrap";
import swal from "sweetalert";
import { getToken } from "../../../store/utlits";
import { useDispatch } from "react-redux";
import {
  deleteDraftThunk,
  getInstagramDraftsThunk,
} from "../../../store/instagram";
import EditDraftForm from "./EditDraftForm";
import { useTranslation } from "react-i18next";

const localizer = momentLocalizer(moment);

export default function ScheduledDraftsCalendarView({
  drafts = [],
  onDeleted,
  onCreateClick,
}) {
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [events, setEvents] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState("preview"); // 'preview' or 'edit'

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

  const handleSelectEvent = (event) => {
    setSelectedDraft(event.draft);
  };

  const eventStyleGetter = (event) => {
    const isPublished = event?.draft?.status === "published";

    return {
      style: {
        backgroundColor: isPublished ? "#16a34a" : "#dd2f6e", // green vs indigo
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
      await dispatch(deleteDraftThunk(selectedDraft.id)); // ✅ removes from state
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
        <h3 className="fw-bold">📅 {t("marketing.draft_list.title_insta")}</h3>
        <p className="text-muted mb-0">
          {t("marketing.draft_list.desc_insta")}
        </p>
      </div>

      {drafts.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted">{t("marketing.draft_list.no_posts")}</p>
          <Button variant="primary" onClick={onCreateClick}>
            + {t("marketing.instagram.post_types.ai_schedule")}
          </Button>
        </div>
      ) : (
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          onSelectEvent={handleSelectEvent}
          views={["month", "day"]}
          popup
          defaultView="month"
          eventPropGetter={eventStyleGetter}
          className="mb-5 border rounded shadow-sm p-3 calendar-view"
        />
      )}

      {/* Post Detail Modal */}
      <Modal
        show={!!selectedDraft}
        onHide={() => setSelectedDraft(null)}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-semibold">
            📌 {t("draft_list.modal_details_title")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedDraft && viewMode === "preview" && (
            <>
              <Carousel
                interval={null}
                className="mb-4 border rounded overflow-hidden"
              >
                {JSON.parse(selectedDraft.media_url || "[]").map(
                  (url, index) => {
                    // Check if URL is a video by file extension
                    const isVideo = /\.(mp4|mov|webm|avi|mkv)$/i.test(url);
                    
                    return (
                      <Carousel.Item key={index}>
                        {isVideo ? (
                          <video
                            className="d-block w-100"
                            src={url}
                            controls
                            style={{ objectFit: "cover", maxHeight: 400 }}
                          >
                            {t("common.video_not_supported")}
                          </video>
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
                  },
                )}
              </Carousel>

              <h5 className="fw-bold mb-2">
                {t("common.approximately")} -{" "}
                {moment(selectedDraft.delivery_date).format(
                  "dddd, MMMM Do YYYY • h:mm A",
                )}
              </h5>
              <p className="mb-3 fs-6 text-secondary">
                {selectedDraft.caption || (
                  <em className="text-muted">{t("draft_list.no_caption")}</em>
                )}
              </p>

              <div className="d-flex flex-wrap gap-2">
                <Badge
                  bg={selectedDraft.status === "published" ? "success" : "info"}
                  className="px-3 py-2"
                >
                  {selectedDraft.status === "published"
                    ? t("draft_list.status_published")
                    : t("draft_list.status_scheduled")}
                </Badge>
                <Badge bg="primary" className="px-3 py-2">
                  {selectedDraft.created_by === "AI"
                    ? t("draft_list.created_ai")
                    : t("draft_list.created_manual")}
                </Badge>
              </div>
            </>
          )}

          {selectedDraft && viewMode === "edit" && (
            <EditDraftForm
              draft={selectedDraft}
              onCancel={() => setViewMode("preview")}
              onSaveSuccess={() => {
                setSelectedDraft(null);
                setViewMode("preview");
                dispatch(getInstagramDraftsThunk());
              }}
            />
          )}
        </Modal.Body>

        <Modal.Footer className="border-0 d-flex justify-content-between">
          {viewMode === "preview" && (
            <>
              {selectedDraft?.status !== "published" && (
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <Spinner animation="border" size="sm" className="me-2" />
                  ) : (
                    t("marketing.draft_list.delete_btn")
                  )}
                </Button>
              )}

              <div className="d-flex gap-2">
                {selectedDraft?.status !== "published" && (
                  <Button
                    variant="outline-primary"
                    onClick={() => setViewMode("edit")}
                  >
                    {t("draft_list.edit_btn")}
                  </Button>
                )}
                <Button
                  variant="outline-secondary"
                  onClick={() => setSelectedDraft(null)}
                >
                  {t("draft_list.close_btn")}
                </Button>
              </div>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </Card>
  );
}
