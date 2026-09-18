/// Side nav menu toggle (mobile drawer)
export function NavMenuToggle() {
  setTimeout(() => {
    const mainwrapper = document.querySelector("#main-wrapper");
    if (!mainwrapper) return;
    if (mainwrapper.classList.contains("menu-toggle")) {
      mainwrapper.classList.remove("menu-toggle");
    } else {
      mainwrapper.classList.add("menu-toggle");
    }
  }, 120);
}

/** Logo lives in the Soft UI sidebar — keep empty so template nav-header stays hidden. */
const NavHader = () => null;

export default NavHader;
