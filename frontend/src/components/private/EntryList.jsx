import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
} from "react";
import { List } from "devextreme-react/list";
import { entryApi } from "../../API/taskifyAi";
import CustomStore from "devextreme/data/custom_store";
import DataSource from "devextreme/data/data_source";
import EntryDetailPopup from "./EntryDetailPopup";
import { AiFillPushpin, AiOutlinePushpin } from "react-icons/ai";
import { BsTrash } from "react-icons/bs";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const EntryList = forwardRef((props, ref) => {
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [selectedItemKeys, setSelectedItemKeys] = useState([]);

  const handlePinToggle = async (entry, e) => {
    e.stopPropagation();

    try {
      const updatedEntry = {
        ...entry,
        isPinned: !entry.isPinned,
      };

      const result = await entryApi.updateEntry(entry._id, updatedEntry);

      if (result.success) {
        listDataSource.reload();
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to update pin status!",
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
        title: "An error occurred!",
        toast: true,
        position: "top-end",
        timer: 2100,
        showConfirmButton: false,
      });
    }
  };

  const handleDeleteEntry = async (entry, e) => {
    e.stopPropagation();

    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This entry will be permanently deleted!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        const deleteResult = await entryApi.deleteEntry(entry._id);
        if (deleteResult.success) {
          listDataSource.reload();
          Swal.fire({
            icon: "success",
            title: "Entry deleted successfully!",
            toast: true,
            position: "top-end",
            timer: 1600,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Failed to delete entry!",
            toast: true,
            position: "top-end",
            timer: 2100,
            showConfirmButton: false,
          });
        }
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "An error occurred!",
        toast: true,
        position: "top-end",
        timer: 2100,
        showConfirmButton: false,
      });
    }
  };

  const [listDataSource] = useState(
    () =>
      new DataSource({
        store: new CustomStore({
          key: "_id",
          load: async (loadOptions) => {
            try {
              const { skip = 0, take = 4, searchValue } = loadOptions;
              const result = await entryApi.getAllEntries({
                params: {
                  skip,
                  limit: take,
                  searchvalue: searchValue,
                },
              });

              return {
                data: result.data || [],
                totalCount: result.totalCount || 0,
              };
            } catch (err) {
              console.error(err);
              Swal.fire({
                icon: "error",
                title: "Data loading failed!",
                toast: true,
                position: "top-end",
                timer: 2100,
                showConfirmButton: false,
              });

              return {
                data: [],
                totalCount: 0,
              };
            }
          },
          update: async (key, values) => {
            try {
              const result = await entryApi.updateEntry(key, values);

              return result;
            } catch (error) {
              console.error(error);
              Swal.fire({
                icon: "error",
                title: "Update failed!",
                toast: true,
                position: "top-end",
                timer: 2100,
                showConfirmButton: false,
              });

              throw error;
            }
          },
          remove: async (key) => {
            try {
              const result = await entryApi.deleteEntry(key);
              return result;
            } catch (error) {
              console.error(error);
              Swal.fire({
                icon: "error",
                title: "Delete failed!",
                toast: true,
                position: "top-end",
                timer: 2100,
                showConfirmButton: false,
              });
              throw error;
            }
          },
        }),
        paginate: true,
        pageSize: 4,
      })
  );

  const refreshList = useCallback(() => {
    listDataSource.reload();
  }, [listDataSource]);

  const handleEntryUpdate = useCallback(
    (updatedEntry) => {
      if (!updatedEntry) return;

      setSelectedEntry(updatedEntry);
      setTimeout(() => {
        refreshList();
      }, 500);
    },
    [refreshList]
  );

  useImperativeHandle(ref, () => ({
    refresh: refreshList,
  }));

  const handleEntryClick = (e) => {
    setSelectedEntry(e.itemData);
    setSelectedItemKeys([e.itemData._id]);
    setIsPopupVisible(true);
  };

  const togglePopup = useCallback(() => {
    setIsPopupVisible(false);
    setTimeout(() => {
      setSelectedEntry(null);
    }, 300);
  }, []);

  const stripHtml = (html) => {
    if (!html) return "";
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = dayjs(dateString);
    return `${date.format("DD.MM.YYYY • HH:mm")} (${date.fromNow()})`;
  };

  const removeBrTags = (html) => {
    if (!html) return "";

    return html.replace(/<br\s*\/?>/gi, " ");
  };

  return (
    <div className="mt-8 shadow-xl rounded-lg overflow-hidden min-h-[300px] border border-gray-300">
      <List
        dataSource={listDataSource}
        focusedRowEnabled={false}
        selectedItemKeys={selectedItemKeys}
        selectionMode="single"
        className="entry-list !flex !justify-end flex-wrap sm:gap-4 sm:!pt-7 !py-5 gap-3 "
        focusStateEnabled={false}
        activeStateEnabled={false}
        hoverStateEnabled={true}
        itemRender={(item) => (
          <div className="p-0 sm:p-4 border-gray-200 last:border-0 flex flex-wrap ">
            <div className="flex items-center justify-between flex-1 flex-wrap sm:flex-nowrap mb-4 gap-3 sm:gap-0">
              <div className="flex !w-full flex-wrap gap-2 flex-grow  sm:mb-0">
                {item.tags.map((tag) => (
                  <span
                    key={tag._id}
                    className="px-4  text-base border border-solid rounded-full"
                    style={{
                      backgroundColor: tag.bgColor,
                      borderColor: tag.borderColor,
                      color: tag.color,
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-5">
                <span className="text-sm text-gray-500">
                  {formatDate(item.createdAt)}
                </span>
                <button
                  className="text-gray-600 hover:text-yellow-500 transition-colors"
                  onClick={(e) => handlePinToggle(item, e)}
                >
                  {item.isPinned ? (
                    <AiFillPushpin className="text-yellow-500" size={22} />
                  ) : (
                    <AiOutlinePushpin size={22} />
                  )}
                </button>
                <button
                  className="text-gray-600 hover:text-red-500 transition-colors"
                  onClick={(e) => handleDeleteEntry(item, e)}
                >
                  <BsTrash size={20} />
                </button>
              </div>
            </div>

            <div className=" text-[18px] text-gray-800 !bg-none !mb-2 !line-clamp-3 sm:!line-clamp-1 text-wrap w-full">
              <div
                dangerouslySetInnerHTML={{ __html: removeBrTags(item.content) }}
              />
            </div>

            {item.aiContent && (
              <div>
                <div className="text-sm text-gray-500 line-clamp-2 mb-2 text-wrap">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: removeBrTags(item.aiContent),
                    }}
                  />
                </div>
              </div>
            )}

            {item.files && item.files.length > 0 && (
              <div className="flex gap-2 mt-2">
                {item.files.slice(0, 3).map((imageUrl, index) => (
                  <div key={index} className="relative h-20 w-20">
                    <img
                      src={imageUrl}
                      alt={`Image ${index + 1}`}
                      className="h-full w-full object-cover rounded"
                    />
                    {index === 2 && item.files.length > 3 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                        <span className="text-white font-semibold">
                          +{item.files.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        searchEnabled={true}
        searchExpr="content"
        searchMode="startswith"
        itemDeleteMode="none"
        allowItemDeleting={false}
        onItemClick={handleEntryClick}
        searchTimeout={300}
        noDataText="Let's start the first entry with Taskify :)"
        pageLoadMode="nextButton"
        searchEditorOptions={{
          stylingMode: "filled",
          placeholder: "Search entries...",
          showClearButton: true,
        }}
      />

      <EntryDetailPopup
        visible={isPopupVisible}
        togglePopup={togglePopup}
        selectedEntry={selectedEntry}
        onUpdate={handleEntryUpdate}
      />
    </div>
  );
});

EntryList.displayName = "EntryList";
export default EntryList;
