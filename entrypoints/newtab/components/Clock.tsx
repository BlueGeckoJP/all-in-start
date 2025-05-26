import { createDateNow } from "@solid-primitives/date";
import styles from "./Clock.module.css";

export default function Clock() {
  const [date] = createDateNow(1000);

  return (
    <div class={`${styles.clock} montserrat component-box`}>
      <div class={styles["big-text"]}>
        {date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
      <div class={styles["small-text"]}>
        {date().toLocaleDateString([], {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      </div>
    </div>
  );
}
