import React, { Fragment, useState } from "react";
import SideBar from "./SideBar";
import HeaderPremium from "./HeaderPremium";
import ChatBox from "../ChatBox";
import "./ShellChrome.css";

const JobieNav = ({ title, onClick: ClickToAddEvent, onClick2, onClick3 }) => {
  const [toggle, setToggle] = useState("");
  const onClick = (name) => setToggle(toggle === name ? "" : name);

  return (
    <Fragment>
      <SideBar onClick={() => onClick2()} onClick3={() => onClick3()} />
      <HeaderPremium
        onNote={() => onClick("chatbox")}
        onNotification={() => onClick("notification")}
        onProfile={() => onClick("profile")}
        toggle={toggle}
        title={title}
        onBox={() => onClick("box")}
        onClick={() => ClickToAddEvent()}
      />
      <ChatBox onClick={() => onClick("chatbox")} toggle={toggle} />
    </Fragment>
  );
};

export default JobieNav;
