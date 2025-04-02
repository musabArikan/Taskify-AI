import React, { useState, useCallback, useMemo, useEffect } from "react";
import Popup from "devextreme-react/popup";
import ScrollView from "devextreme-react/scroll-view";
import { Button } from "devextreme-react/button";
import { entryApi } from "../../API/taskifyAi";
import Swal from "sweetalert2";
import EntryEditForm from "./EntryEditForm";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const EntryDetailPopup = ({
  visible,
  togglePopup,
  selectedEntry,
  onUpdate,
}) => {
  const [isUpdatingAI, setIsUpdatingAI] = useState(false);
  const [showEditMode, setShowEditMode] = useState(false);
  const [currentEntry, setCurrentEntry] = useState(null);

  useEffect(() => {
    if (visible && selectedEntry) {
      setCurrentEntry(selectedEntry);
    }
  }, [visible, selectedEntry]);

  useEffect(() => {
    if (!visible) {
      setCurrentEntry(null);
      setShowEditMode(false);
    }
  }, [visible]);

  const handleUpdateAIContent = async () => {
    try {
      setIsUpdatingAI(true);
      const result = await entryApi.getAIAdvice(selectedEntry.content);

      if (result.success) {
        const updateResult = await entryApi.updateEntry(selectedEntry._id, {
          ...selectedEntry,
          aiContent: result.data,
        });

        if (updateResult.success) {
          setCurrentEntry(updateResult.data);
          onUpdate && onUpdate(updateResult.data);
        }
      }
    } catch (error) {
      console.error("AI Advice update error:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to update AI Advice!",
        toast: true,
        position: "top-end",
        timer: 2100,
        showConfirmButton: false,
      });
    } finally {
      setIsUpdatingAI(false);
    }
  };

  const handleEditClick = () => {
    setShowEditMode(true);
  };

  const handleEditSave = useCallback(
    (updatedEntry) => {
      setCurrentEntry(updatedEntry);
      setShowEditMode(false);
      onUpdate && onUpdate(updatedEntry);
    },
    [onUpdate]
  );

  const displayEntry = useMemo(
    () => currentEntry || selectedEntry,
    [currentEntry, selectedEntry]
  );

  const openImageInNewTab = (imageUrl) => {
    window.open(imageUrl, "_blank");
  };

  const renderImages = useMemo(() => {
    if (!displayEntry?.files?.length)
      return (
        <div>
          <label className="block text-lg font-semibold mb-2">Images</label>{" "}
          <div>No images upload yet</div>
        </div>
      );

    return (
      <div className="mb-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">Images</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {displayEntry.files.map((imageUrl, index) => (
            <div
              key={index}
              className="relative group h-40"
              onClick={() => openImageInNewTab(imageUrl)}
            >
              <img
                src={imageUrl}
                alt={`Image ${index + 1}`}
                className="h-full w-full object-cover rounded shadow-sm cursor-pointer "
              />

              <div className="absolute inset-0 bg-transparent transition-all cursor-pointer duration-200 flex items-center justify-center">
                <div className="absolute inset-0 backdrop-blur-0 group-focus:backdrop-blur-sm group-hover:backdrop-blur-sm transition-all duration-300"></div>

                <div className="opacity-80 sm:opacity-20 group-hover:opacity-100 transition-opacity duration-200 z-10">
                  <i className="bi bi-fullscreen text-white text-2xl drop-shadow-lg"></i>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }, [displayEntry?.files]);

  const formatDetailDate = (dateString) => {
    if (!dateString) return "-";
    const date = dayjs(dateString);
    return `${date.format("DD.MM.YYYY • HH:mm")} (${date.fromNow()})`;
  };

  if (!displayEntry) {
    return null;
  }

  return (
    <Popup
      visible={visible && !!displayEntry}
      onHiding={togglePopup}
      dragEnabled={false}
      hideOnOutsideClick={true}
      showCloseButton={true}
      showTitle={true}
      title="Entry Details"
      width="90vw"
      height="90vh"
      maxWidth={1200}
      className="entry-detail-popup"
      toolbarItems={[
        {
          widget: "dxButton",
          toolbar: "top",
          location: "after",
          options: {
            icon: "edit",
            onClick: handleEditClick,
            stylingMode: "text",
            type: "default",
          },
        },
      ]}
    >
      {showEditMode ? (
        <EntryEditForm
          entry={displayEntry}
          onSave={handleEditSave}
          onCancel={() => setShowEditMode(false)}
        />
      ) : (
        <ScrollView width="100%" height="100%">
          <div className="p-4">
            <div className="mb-4 px-3  w-full flex ">
              <div
                className="text-lg"
                dangerouslySetInnerHTML={{ __html: displayEntry?.content }}
              />
            </div>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">AI Advice</h3>
                <Button
                  text={isUpdatingAI ? "Updating..." : "Update AI Advice"}
                  type="success"
                  stylingMode="outlined"
                  onClick={handleUpdateAIContent}
                  disabled={isUpdatingAI}
                  icon="bi bi-magic"
                />
              </div>
              <div
                className="p-3 "
                dangerouslySetInnerHTML={{
                  __html: displayEntry?.aiContent || "No AI Advice yet",
                }}
              />
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {displayEntry?.tags?.length > 0 ? (
                  displayEntry.tags.map((tag) => (
                    <span
                      key={tag._id}
                      className="px-4  text-base border border-solid rounded-full"
                      style={{
                        backgroundColor: tag.bgColor,
                        borderColor: tag.borderColor,
                        color: tag.color,
                      }}
                    >
                      {tag?.name}
                    </span>
                  ))
                ) : (
                  <span className="p-3 w-full">No tags yet</span>
                )}
              </div>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Created At</h3>
              <p className="p-3  w-full">
                {displayEntry?.createdAt
                  ? formatDetailDate(displayEntry.createdAt)
                  : "-"}
              </p>
            </div>
            {renderImages}
          </div>
        </ScrollView>
      )}
    </Popup>
  );
};

export default EntryDetailPopup;
