// For side-effect imports like: import './style.scss'
declare module "*.scss";

// For CSS Modules like: import styles from './style.module.scss'
declare module "*.module.scss" {
  const classes: { [key: string]: string };
  export default classes;
}