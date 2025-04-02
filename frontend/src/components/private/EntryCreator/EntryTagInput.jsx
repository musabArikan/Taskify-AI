import React, { useEffect, useState } from "react";
import TagBox from "devextreme-react/tag-box";
import { tagApi } from "../../../API/taskifyAi";

const EntryTagInput = ({ value, onChange }) => {
  const [availableTags, setAvailableTags] = useState([]);

  useEffect(() => {
    const fetchTags = async () => {
      const result = await tagApi.getAllTags();
      if (result.success) {
        setAvailableTags(result.data);
      }
    };
    fetchTags();
  }, []);

  const handleCustomItemCreating = async (e) => {
    e.customItem = {
      _id: Date.now().toString(),
      name: e.text,
      isCustom: true,
    };

    const result = await tagApi.createTag({ name: e.text });
    if (result.success) {
      setAvailableTags((prev) => [...prev, result.data]);
      onChange([...value, result.data._id]);
    }
    return e.customItem;
  };

  return (
    <TagBox
      dataSource={availableTags}
      value={value}
      onValueChanged={(e) => onChange(e.value)}
      valueExpr="_id"
      displayExpr="name"
      maxDisplayedTags={7}
      showMultiTagOnly={false}
      searchEnabled={true}
      acceptCustomValue={true}
      onCustomItemCreating={handleCustomItemCreating}
      placeholder="Select or create tags..."
      closeMenuOnSelect={false}
      openOnFieldClick={true}
      hideSelectedItems={false}
    />
  );
};

export default EntryTagInput;
