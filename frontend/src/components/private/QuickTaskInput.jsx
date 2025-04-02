import React, { useCallback } from "react";
import TextBox from "devextreme-react/text-box";
import { Button } from "devextreme-react/button";

const QuickTaskInput = ({ onActivate }) => {
  const handleFocus = useCallback(() => {
    onActivate();
  }, [onActivate]);

  const handleAddClick = useCallback(() => {
    onActivate();
  }, [onActivate]);

  return (
    <div className="bg-white border border-gray-300 py-4 md:py-6 md:px-6 px-5 rounded-lg shadow-md w-full transition-all duration-300">
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 justify-end sm:justify-center">
        <TextBox
          placeholder="Create a task with AI or type your task..."
          stylingMode="filled"
          onFocusIn={handleFocus}
          className="flex-grow  "
          height={50}
        />
        <Button
          icon="plus"
          type="default"
          text="Add Task"
          onClick={handleAddClick}
          stylingMode="contained"
          className="!h-[40px] sm:!h-[50px]  !w-auto  "
        />
      </div>
    </div>
  );
};

export default QuickTaskInput;
