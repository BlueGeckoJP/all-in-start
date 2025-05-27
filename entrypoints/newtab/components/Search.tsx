import styles from "./Search.module.css";

import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import Fa from "solid-fa";

export default function Search() {
  return (
    <div class={`montserrat component-box ${styles.search}`}>
      <div class={styles.searchBox}>
        <Fa icon={faGoogle} />
        <input class={styles.input} type="text" placeholder="Search..." />
      </div>
    </div>
  );
}
