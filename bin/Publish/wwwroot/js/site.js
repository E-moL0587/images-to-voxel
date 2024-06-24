document.addEventListener('DOMContentLoaded', function () {
  const titleScreen = document.getElementById('titleScreen');
  const menuScreen = document.getElementById('menuScreen');
  const titleButton = document.getElementById('titleButton');

  titleButton.addEventListener('click', function () {
      titleScreen.classList.add('hidden');
      menuScreen.classList.remove('hidden');
  });
});
