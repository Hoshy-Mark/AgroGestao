import styles from "./EmConstrucao.module.css";

export function EmConstrucao({
  titulo,
  texto,
}: {
  titulo: string;
  texto: string;
}) {
  return (
    <div className={styles.wrap}>
      <span className={styles.icone}>🚧</span>
      <div className={styles.titulo}>{titulo}</div>
      <p className={styles.texto}>{texto}</p>
    </div>
  );
}
