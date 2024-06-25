document.addEventListener('DOMContentLoaded', function () {
  const titleScreen = document.getElementById('titleScreen');
  const titleButton = document.getElementById('titleButton');

  titleButton.addEventListener('click', function () {
      titleScreen.classList.add('hidden');
  });
});
