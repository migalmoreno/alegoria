import { useBookmarkStore } from "~/bookmarkStore";
import {
  ItemsPaginationContainer,
  MediaBoardItemContainer,
  NoDataContainer,
} from "~/components";
import { X } from "lucide-react";

export const BookmarksPage = () => {
  const { bookmarks, remove, _hasHydrated } = useBookmarkStore();

  if (!_hasHydrated) return null;
  if (!bookmarks.length) return <NoDataContainer />;

  return (
    <ItemsPaginationContainer columns="xs:grid-cols-2 lg:grid-cols-3">
      {bookmarks.map((bookmark) => (
        <div key={bookmark.url} className="relative group min-w-0">
          <MediaBoardItemContainer
            post={{
              url: bookmark.url,
              name: bookmark.title,
              thumbnail: bookmark.thumbnail,
              date: bookmark.addedAt,
            }}
          />
          <button
            onClick={() => remove(bookmark.url)}
            className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
            title="Remove bookmark"
          >
            <X size={12} className="text-white" />
          </button>
        </div>
      ))}
    </ItemsPaginationContainer>
  );
};
