import React, { useState, useEffect } from "react";
import { Button } from "devextreme-react/button";
import TextArea from "devextreme-react/text-area";
import { entryApi } from "../../API/taskifyAi";
import Swal from "sweetalert2";
import EntryTagInput from "./EntryCreator/EntryTagInput";

const EntryEditForm = ({ entry, onSave, onCancel }) => {
  if (!entry) {
    return null;
  }

  const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const [content, setContent] = useState(stripHtml(entry.content || ""));
  const [aiContent, setAiContent] = useState(entry.aiContent || "");
  const [selectedTags, setSelectedTags] = useState(
    entry.tags?.map((tag) => tag._id) || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingAI, setIsUpdatingAI] = useState(false);
  const [files, setFiles] = useState(entry.files || []);

  const handleUpdateAIContent = async () => {
    try {
      setIsUpdatingAI(true);
      const result = await entryApi.getAIAdvice(content);

      if (result.success) {
        setAiContent(result.data);
      }
    } catch (error) {
      console.error("AI Advice update error:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to update AI Advice",
        toast: true,
        position: "top-end",
        timer: 2100,
        showConfirmButton: false,
      });
    } finally {
      setIsUpdatingAI(false);
    }
  };

  useEffect(() => {
    if (entry.aiContent) {
      const tmp = document.createElement("div");
      tmp.innerHTML = entry.aiContent;
      const plainText = tmp.textContent || tmp.innerText || "";
      setAiContent(plainText);
    }
  }, [entry.aiContent]);

  const handleSave = async () => {
    if (!content.trim()) {
      console.error("Content cannot be empty");
      Swal.fire({
        icon: "error",
        title: "Content cannot be empty",
        toast: true,
        position: "top-end",
        timer: 2100,
        showConfirmButton: false,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const updatedEntry = {
        ...entry,
        content: `<p>${content}</p>`,
        aiContent,
        tags: selectedTags,
        files: files,
      };

      const result = await entryApi.updateEntry(entry._id, updatedEntry);

      if (result.success) {
        onSave(result.data);
      } else {
        console.log("result mesage error:", result.message);
        Swal.fire({
          icon: "error",
          title: result.message,
          toast: true,
          position: "top-end",
          timer: 2100,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Failed to update entry", error);
      Swal.fire({
        icon: "error",
        title: "Failed to update entry!",
        toast: true,
        position: "top-end",
        timer: 2100,
        showConfirmButton: false,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-grow overflow-y-auto pb-20">
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-lg font-semibold mb-2">Content</label>
            <TextArea
              value={content}
              onValueChanged={(e) => setContent(e.value)}
              height={75}
              valueType="text"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-lg font-semibold">AI Advice</label>
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
              className="bg-gray-50 p-3 rounded border border-gray-200 min-h-[75px] overflow-auto"
              dangerouslySetInnerHTML={{ __html: aiContent }}
            />
          </div>

          <div>
            <label className="block text-lg font-semibold mb-2">Tags</label>
            <EntryTagInput
              value={selectedTags}
              onChange={(tags) => setSelectedTags(tags)}
            />
          </div>

          <div>
            <label className="block text-lg font-semibold mb-2">Images</label>
            {files.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                {files.map((imageUrl, index) => (
                  <div key={index} className="relative h-40">
                    <div className="cursor-pointer h-full">
                      <img
                        src={imageUrl}
                        alt={`Image ${index + 1}`}
                        className="h-full w-full object-cover rounded"
                      />
                    </div>

                    <button
                      className="absolute cursor-pointer top-2 right-2 bg-red-500 text-white py-1.5 px-2 rounded-full shadow-lg z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFiles(files.filter((_, i) => i !== index));
                      }}
                    >
                      <i className="bi bi-trash text-sm"></i>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div>No images uploaded yet</div>
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-white shadow-top p-4 z-10 ">
        <div className="flex justify-end gap-3">
          <Button
            text="Cancel"
            stylingMode="outlined"
            type="default"
            onClick={onCancel}
          />
          <Button
            text={isSubmitting ? "Saving..." : "Save Changes"}
            type="default"
            stylingMode="contained"
            onClick={handleSave}
            disabled={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};

export default EntryEditForm;
