import printMe from './printMe';

function component() {
  const element = document.createElement('div');

  element.innerHTML = `Hello webpack`;

  printMe();

  return element;
}

document.body.appendChild(component());
