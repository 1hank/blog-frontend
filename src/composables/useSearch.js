import { ref } from "vue";

const open = ref(false);

export function useSearch() {
  return {
    searchOpen: open,
    openSearch: () => {
      open.value = true;
    },
    closeSearch: () => {
      open.value = false;
    },
    toggleSearch: () => {
      open.value = !open.value;
    },
  };
}
