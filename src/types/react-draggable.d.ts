declare module 'react-draggable' {
  import * as React from 'react';

  export interface DraggableData {
    node: HTMLElement;
    x: number;
    y: number;
    deltaX: number;
    deltaY: number;
    lastX: number;
    lastY: number;
  }

  export interface DraggableEvent extends MouseEvent, TouchEvent {}

  export interface DraggableProps {
    nodeRef?: React.RefObject<HTMLElement>;
    position?: { x: number; y: number };
    handle?: string;
    onDrag?: (e: DraggableEvent, data: DraggableData) => void;
    onStart?: (e: DraggableEvent, data: DraggableData) => void;
    onStop?: (e: DraggableEvent, data: DraggableData) => void;
    children: React.ReactNode;
  }

  export default class Draggable extends React.Component<DraggableProps> {}
}


