import React, { useState, useCallback, useRef } from "react";
import FileUploader from "devextreme-react/file-uploader";
import { entryApi } from "../../../API/taskifyAi";
import EntryContentInput from "./EntryContentInput";
import EntryTagInput from "./EntryTagInput";
import { Button } from "devextreme-react/button";
import Swal from "sweetalert2";

const EntryCreator = ({ handleEntryCreated, onClose }) => {
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [aiContent, setAiContent] = useState("");
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editorRef = useRef(null);

  const handleContentChange = useCallback((value) => {
    setContent(value);
  }, []);

  const handleTagsChange = useCallback((value) => {
    setSelectedTags(value);
  }, []);

  const handleFileUploaderValueChanged = useCallback((e) => {
    setFiles((prevFiles) => {
      const newFiles = e.value || [];
      const uniqueFiles = [
        ...new Map(
          [...prevFiles, ...newFiles].map((file) => [file.name, file])
        ).values(),
      ];
      return uniqueFiles;
    });
  }, []);

  const onUploadStarted = useCallback((e) => {
    console.log("Upload started:", e);
  }, []);

  const onUploadError = useCallback((e) => {
    console.error("Upload error:", e);
    Swal.fire({
      icon: "error",
      title: "File upload failed!",
      toast: true,
      position: "top-end",
      timer: 2100,
      showConfirmButton: false,
    });
  }, []);

  const onUploadAborted = useCallback(() => {
    Swal.fire({
      icon: "warning",
      title: "Upload cancelled!",
      toast: true,
      position: "top-end",
      timer: 2100,
      showConfirmButton: false,
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!content) {
      Swal.fire({
        icon: "error",
        title: "Please enter content!",
        toast: true,
        position: "top-end",
        timer: 2100,
        showConfirmButton: false,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("selectedTags", JSON.stringify(selectedTags));

      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append("files", file);
        });
      }

      if (aiContent) {
        formData.append("aiContent", aiContent);
      }

      const result = await entryApi.createEntry(formData);

      if (result.success) {
        setContent("");
        setSelectedTags([]);
        setAiContent("");
        setFiles([]);

        if (editorRef && editorRef.current) {
          editorRef.current.option("value", "");
        }

        Swal.fire({
          title: "Entry created!",
          icon: "success",
          toast: true,
          position: "top-end",
          timer: 2100,
          showConfirmButton: false,
        });

        handleEntryCreated && handleEntryCreated();
      } else {
        Swal.fire({
          title: "Failed to create entry!",
          icon: "error",
          toast: true,
          position: "top-end",
          timer: 2100,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "An error occurred.",
        toast: true,
        position: "top-end",
        timer: 2100,
        showConfirmButton: false,
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [content, selectedTags, aiContent, files, handleEntryCreated]);

  const renderFilePreview = useCallback(() => {
    if (!files.length) return null;

    return (
      <div className="grid grid-cols-3 gap-4 mt-4 mb-2 mx-2">
        {files.map((file, index) => (
          <div key={index} className="relative group">
            <img
              src={URL.createObjectURL(file)}
              alt={`Preview ${index + 1}`}
              className="w-full h-32 object-cover rounded"
            />
            <button
              className="absolute top-2 right-2 bg-red-500 text-white py-1 px-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => {
                setFiles((prevFiles) =>
                  prevFiles.filter((_, i) => i !== index)
                );
              }}
            >
              <i className="bi bi-trash"></i>
            </button>
          </div>
        ))}
      </div>
    );
  }, [files]);

  return (
    <div className="bg-white border border-gray-300 !p-3 sm:!p-10  md:p-6 pt-12 rounded-lg shadow-md space-y-4 w-full">
      <EntryContentInput
        value={content}
        onChange={handleContentChange}
        onAiContentChange={setAiContent}
        editorRef={editorRef}
      />

      {aiContent && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">AI Advice</h3>
          <div
            className="bg-gray-50"
            dangerouslySetInnerHTML={{ __html: aiContent }}
          />
        </div>
      )}

      <div className=" !w-full ">
        <EntryTagInput value={selectedTags} onChange={handleTagsChange} />
      </div>

      <div className="mt-4 border-dashed  border-gray-200 border">
        <FileUploader
          name="files"
          multiple={true}
          accept="image/jpeg, image/png ,image/webp"
          uploadMode="useForm"
          allowedFileExtensions={[".jpg", ".jpeg", ".png", ".webp"]}
          maxFileSize={5000000}
          width="100%"
          labelText="or Drop files here"
          selectButtonText="Select Files"
          onValueChanged={handleFileUploaderValueChanged}
          showFileList={false}
          className=" !ps-1"
        />
        {renderFilePreview()}
      </div>

      <div className="!w-full !h-12 flex items-center  justify-end gap-4 ">
        <Button
          text="Cancel"
          type="default"
          stylingMode="text"
          onClick={onClose}
          className=" !text-[15px]  !w-4/12 sm:!w-2/12"
        />
        <Button
          text={isSubmitting ? "Submitting..." : "Submit"}
          type="default"
          stylingMode="contained"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className=" !text-[15px]  !w-4/12 sm:!w-2/12"
        />
      </div>
    </div>
  );
};

export default EntryCreator;
