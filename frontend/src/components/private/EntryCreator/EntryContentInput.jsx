import { ScrollView } from "devextreme-react/scroll-view";
import { HtmlEditor, Toolbar, Item } from "devextreme-react/html-editor";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Swal from "sweetalert2";
import { entryApi } from "../../../API/taskifyAi";

const sizeValues = ["8pt", "10pt", "12pt", "14pt", "18pt", "24pt", "36pt"];
const fontSizeOptions = { inputAttr: { "aria-label": "Font size" } };

const EntryContentInput = ({
  value,
  onChange,
  onAiContentChange,
  editorRef,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const internalEditorRef = useRef(null);

  useEffect(() => {
    if (editorRef && internalEditorRef.current) {
      editorRef.current = internalEditorRef.current;
    }
  }, [editorRef, internalEditorRef.current]);

  const handleContentChange = useCallback(() => {
    if (internalEditorRef.current) {
      onChange(internalEditorRef.current.option("value"));
    }
  }, [onChange]);

  const handleAIAdvice = useCallback(async () => {
    if (!internalEditorRef.current) return;
    const content = internalEditorRef.current.option("value");
    if (!content) {
      Swal.fire({
        icon: "warning",
        title: "Please enter content first!",
        toast: true,
        position: "top-end",
        timer: 2100,
        showConfirmButton: false,
      });
      return;
    }

    setIsProcessing(true);
    try {
      const result = await entryApi.getAIAdvice(content);

      if (result.error) {
        Swal.fire({
          icon: "info",
          title: "AI Info",
          text: result.message,
          confirmButtonText: "OK",
        });
        return;
      }

      if (result.success) {
        onAiContentChange(result.data);
      }
    } catch (error) {
      console.error("AI advice generation failed:", error);
      Swal.fire({
        icon: "error",
        title: "AI advice generation failed!",
        toast: true,
        position: "top-end",
        timer: 2100,
        showConfirmButton: false,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [onAiContentChange]);

  const handleGrammarFix = useCallback(async () => {
    if (!internalEditorRef.current) return;
    const content = internalEditorRef.current.option("value");
    if (!content) {
      Swal.fire({
        icon: "warning",
        title: "Please enter content first!",
        toast: true,
        position: "top-end",
        timer: 2100,
        showConfirmButton: false,
      });
      return;
    }

    setIsProcessing(true);
    try {
      const result = await entryApi.fixGrammar(content);

      if (result.error) {
        Swal.fire({
          icon: "info",
          title: "Information",
          text: result.message,
          confirmButtonText: "OK",
        });
        return;
      }

      if (result.success) {
        if (result.data.startsWith("Corrected:")) {
          const fixedText = result.data.substring("Corrected:".length).trim();
          const originalText = content.replace(/<\/?[^>]+(>|$)/g, "").trim();

          if (fixedText !== originalText) {
            internalEditorRef.current.option("value", fixedText);
            handleContentChange();

            Swal.fire({
              icon: "success",
              title: "Grammar fixed!",
              toast: true,
              position: "top-end",
              timer: 1600,
              showConfirmButton: false,
            });
          } else {
            Swal.fire({
              icon: "info",
              title: "Information",
              text: "No grammar issues were found in your text.",
              confirmButtonText: "OK",
            });
          }
        } else {
          internalEditorRef.current.option("value", result.data);
          handleContentChange();

          Swal.fire({
            icon: "success",
            title: "Grammar fixed!",
            toast: true,
            position: "top-end",
            timer: 1600,
            showConfirmButton: false,
          });
        }
      }
    } catch (error) {
      console.error("Grammar correction failed:", error);
      Swal.fire({
        icon: "error",
        title: "Grammar correction failed!",
        toast: true,
        position: "top-end",
        timer: 2100,
        showConfirmButton: false,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [handleContentChange]);

  const grammarFixButtonOptions = useMemo(
    () => ({
      text: "Fix",
      icon: "bi bi-stars",
      stylingMode: "outlined",
      type: "default",
      onClick: handleGrammarFix,
      disabled: isProcessing,
    }),
    [isProcessing, handleGrammarFix]
  );

  const aiAdviceButtonOptions = useMemo(
    () => ({
      text: isProcessing ? "Processing..." : "AI Advice",
      icon: "bi bi-magic",
      stylingMode: "outlined",
      type: "success",
      onClick: handleAIAdvice,
      disabled: isProcessing,
    }),
    [isProcessing, handleAIAdvice]
  );

  return (
    <ScrollView width="100%" height="100%">
      <div>
        <div className="widget-container">
          <HtmlEditor
            height="140px"
            defaultValue={value}
            valueType="html"
            rtlEnabled={false}
            placeholder="Create an entry with AI..."
            onInitialized={(e) => {
              internalEditorRef.current = e.component;
              if (editorRef) {
                editorRef.current = e.component;
              }
            }}
            onValueChanged={handleContentChange}
          >
            <Toolbar multiline={false}>
              <Item name="undo" />
              <Item name="redo" />
              <Item name="separator" locateInMenu="always" />
              <Item
                name="size"
                acceptedValues={sizeValues}
                options={fontSizeOptions}
                locateInMenu="auto"
              />
              <Item name="separator" />
              <Item name="bold" locateInMenu="auto" />
              <Item name="separator" locateInMenu="always" />
              <Item name="alignLeft" locateInMenu="always" />
              <Item name="alignCenter" locateInMenu="always" />
              <Item name="alignRight" locateInMenu="always" />
              <Item name="alignJustify" locateInMenu="always" />
              <Item name="separator" locateInMenu="always" />
              <Item name="orderedList" locateInMenu="always" />
              <Item name="bulletList" locateInMenu="always" />
              <Item name="separator" locateInMenu="always" />

              <Item
                widget="dxButton"
                options={grammarFixButtonOptions}
                locateInMenu="never"
                location="after"
              />
              <Item
                widget="dxButton"
                options={aiAdviceButtonOptions}
                locateInMenu="never"
                location="after"
              />
            </Toolbar>
          </HtmlEditor>
        </div>
      </div>
    </ScrollView>
  );
};

export default EntryContentInput;
