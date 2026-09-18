import React, { useMemo, useReducer, useEffect } from "react";
import { Collapse } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MenuList } from "./Menu";
import { NavMenuToggle } from "./NavHader";
import { useDispatch, useSelector } from "react-redux";
import { fetchChainRestaurantsThunk } from "../../../store/chainDashboard";
import logoMark from "../../../images/hutaologo1.png";

const reducer = (previousState, updatedState) => ({
  ...previousState,
  ...updatedState,
});

const initialState = {
  active: "",
  activeSubmenu: "",
};

const SideBar = () => {
  const dispatch = useDispatch();
  const [state, setState] = useReducer(reducer, initialState);
  const { t } = useTranslation();
  const { chain, restaurantsLoaded, restaurantsLoading } = useSelector(
    (state) => state.chainDashboard
  );
  const visibleMenuList = useMemo(
    () =>
      MenuList.filter(
        (item) => item.to !== "master" || (restaurantsLoaded && chain)
      ),
    [chain, restaurantsLoaded]
  );

  let path = window.location.pathname;
  path = path.split("/");
  path = path[path.length - 1];

  useEffect(() => {
    if (!restaurantsLoaded && !restaurantsLoading) {
      dispatch(fetchChainRestaurantsThunk());
    }
  }, [dispatch, restaurantsLoaded, restaurantsLoading]);

  useEffect(() => {
    visibleMenuList.forEach((data) => {
      data.content?.forEach((item) => {
        if (path === item.to) {
          setState({ active: data.title });
        }
        item.content?.forEach((ele) => {
          if (path === ele.to) {
            setState({ activeSubmenu: item.title, active: data.title });
          }
        });
      });
      if (path === data.to) {
        setState({ active: data.title });
      }
    });
  }, [path, visibleMenuList]);

  const handleMenuActive = (status) => {
    setState({ active: state.active === status ? "" : status });
  };

  const handleSubmenuActive = (status) => {
    setState({
      activeSubmenu: state.activeSubmenu === status ? "" : status,
    });
  };

  const handleCloseSidebar = () => {
    if (window.innerWidth <= 991) {
      NavMenuToggle();
    }
    setState({ active: "", activeSubmenu: "" });
  };

  const closeBackdrop = () => {
    if (window.innerWidth <= 991) NavMenuToggle();
  };

  return (
    <>
      <div
        className="om-sidebar-backdrop"
        onClick={closeBackdrop}
        aria-hidden
      />
      <aside className="om-sidebar" aria-label="Main navigation">
        <Link to="/overview" className="om-sidebar-brand" onClick={handleCloseSidebar}>
          <img
            className="om-sidebar-brand-logo"
            src={logoMark}
            alt=""
          />
          <span className="om-sidebar-brand-text">OwnMenu</span>
        </Link>

        <div className="om-sidebar-scroll">
          <ul className="om-nav">
            {visibleMenuList.map((data, index) => {
              if (data.classsChange === "menu-title") {
                return (
                  <li className="om-nav-section" key={index}>
                    {t(data.translationKey || data.title)}
                  </li>
                );
              }

              const hasChildren = data.content && data.content.length > 0;
              const isOpen =
                state.active === data.title ||
                (hasChildren &&
                  data.content.some(
                    (c) =>
                      c.to === path ||
                      (c.content || []).some((leaf) => leaf.to === path)
                  ));
              const isLeafActive = !hasChildren && path === data.to;

              return (
                <li
                  key={index}
                  className={`om-nav-item${isOpen ? " open" : ""}${
                    isLeafActive ? " active" : ""
                  }`}
                >
                  {hasChildren ? (
                    <>
                      <button
                        type="button"
                        className="om-nav-link"
                        onClick={() => handleMenuActive(data.title)}
                      >
                        {data.iconStyle}
                        <span className="om-nav-label">
                          {t(data.translationKey || data.title)}
                        </span>
                        <span className="om-nav-chevron" aria-hidden />
                      </button>
                      <Collapse in={isOpen}>
                        <ul className="om-nav-sub">
                          {data.content.map((child, ind) => {
                            if (child.content && child.content.length > 0) {
                              const nestedOpen =
                                state.activeSubmenu === child.title;
                              return (
                                <li key={ind}>
                                  <Link
                                    to={child.to || "#"}
                                    className={nestedOpen ? "is-active" : ""}
                                    onClick={() =>
                                      handleSubmenuActive(child.title)
                                    }
                                  >
                                    {t(child.translationKey || child.title)}
                                  </Link>
                                  <Collapse in={nestedOpen}>
                                    <ul className="om-nav-sub">
                                      {child.content.map((leaf, leafIdx) => (
                                        <li key={leafIdx}>
                                          <Link
                                            to={leaf.to}
                                            className={
                                              path === leaf.to ? "is-active" : ""
                                            }
                                            onClick={handleCloseSidebar}
                                          >
                                            {t(
                                              leaf.translationKey || leaf.title
                                            )}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  </Collapse>
                                </li>
                              );
                            }
                            return (
                              <li key={ind}>
                                <Link
                                  to={child.to}
                                  className={
                                    path === child.to ? "is-active" : ""
                                  }
                                  onClick={handleCloseSidebar}
                                >
                                  {t(child.translationKey || child.title)}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </Collapse>
                    </>
                  ) : (
                    <Link
                      to={data.to}
                      className={`om-nav-link${
                        path === data.to ? " is-active" : ""
                      }`}
                      onClick={handleCloseSidebar}
                    >
                      {data.iconStyle}
                      <span className="om-nav-label">
                        {t(data.translationKey || data.title)}
                      </span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </>
  );
};

export default SideBar;
