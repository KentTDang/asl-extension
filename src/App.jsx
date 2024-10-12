import React from 'react'
import { createUseStyles } from "react-jss";

const styles =  {
  container: {
    background: "gray",
    width: 800,
    height: 600,
  }
}
const useStyles = createUseStyles(styles);


export default function App() {
const styles = useStyles();


  return (
    <div className={styles.container}>App</div>
  )
}