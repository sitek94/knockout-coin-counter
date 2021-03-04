function component() {
  const element = document.createElement('div');

  const sum = (a, b) => a + b;

  element.innerHTML = `Hello webpack ${sum(10, 20)}`;

  return element;
}

document.body.appendChild(component());
