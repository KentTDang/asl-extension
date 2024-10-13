import React from "react";
import { createUseStyles } from "react-jss";

export default function Hero() {
  const styles = useStyles();
  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <img
          src="/assets/applogo.png"
          alt="LiveHands Logo"
          className={styles.logo}
        />
        <p className={styles.header}>LiveHands</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "#fff",
    fontFamily: " 'Poppins', sans-serif",
    borderBottom: "2px solid #e5e5e5",
    color: "#343a40",
  },
  headerContainer: {
    display: "flex",
    alignItems: "center",
  },
  header: {
    fontSize: "22px",
    fontWeight: 600,
    padding: "6px"
  },
  logo: {
    height: "50px",
    width: "50px",
  },
};
const useStyles = createUseStyles(styles);
