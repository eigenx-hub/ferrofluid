import { startApp } from './app';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const sidebar = document.getElementById('sidebar') as HTMLElement;

startApp(canvas, sidebar);
