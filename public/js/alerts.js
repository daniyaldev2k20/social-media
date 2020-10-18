/* eslint-disable*/

//removes alert via JS trick in which we move one level upto parent element and then
//from parent level, remove child element; in this case .alert element
export const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) {
    el.parentElement.removeChild(el);
  }
};

// type is 'success' or 'error' because of css class .alert and its alert--success/error
export const showAlert = (type, msg, time = 7) => {
  hideAlert(); //this hides all existing alerts
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, time * 1000);
};
