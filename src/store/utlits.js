export const getToken = () => {
  return localStorage.getItem("ownmenutoken");
};

export const getMasterToken = () => {
  return localStorage.getItem("ownmenu-master");
}
