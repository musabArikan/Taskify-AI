import React, { useCallback, useRef, useState } from "react";
import EntryList from "./EntryList";
import EntryCreator from "./EntryCreator/EntryCreator";
import QuickTaskInput from "./QuickTaskInput";

const EntryBoard = () => {
  const listRef = useRef(null);
  const [showCreator, setShowCreator] = useState(false);

  const handleEntryCreated = useCallback(() => {
    if (listRef.current) {
      listRef.current.refresh();
    }
    setShowCreator(false);
  }, []);

  const handleActivateCreator = useCallback(() => {
    setShowCreator(true);
  }, []);

  const handleCloseCreator = useCallback(() => {
    setShowCreator(false);
  }, []);

  return (
    <div className="flex flex-wrap sm:gap-14 gap-5 justify-center mt-4 sm:mt-10">
      <div className="min-w-full">
        {showCreator ? (
          <div className="relative entry-creator-container">
            <EntryCreator
              handleEntryCreated={handleEntryCreated}
              onClose={handleCloseCreator}
            />
          </div>
        ) : (
          <div className="quick-task-container">
            <QuickTaskInput onActivate={handleActivateCreator} />
          </div>
        )}
      </div>
      <div className="min-w-full">
        <EntryList ref={listRef} />
      </div>
    </div>
  );
};

export default EntryBoard;
