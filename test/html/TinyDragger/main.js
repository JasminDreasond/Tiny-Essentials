document.addEventListener('DOMContentLoaded', () => {
  const box = document.getElementById('dragMe');
  const jail = document.getElementById('jail');
  const target = document.getElementById('target1');

  const dragger = new TinyDragger(box, {
    jail: jail,
    lockInsideJail: true,
    collisionByMouse: true,
    revertOnDrop: false,
    vibration: {
      start: [30],
      move: [5],
      collide: [80],
      end: [20, 10, 20],
    },
  });

  dragger.addCollidable(target);

  box.addEventListener('drag', () => console.log('[drag] started'));
  box.addEventListener('dragging', () => console.log('[dragging] moving'));
  box.addEventListener('drop', (e) => {
    console.log('[drop]', e.detail);
  });
});
