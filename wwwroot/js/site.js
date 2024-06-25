document.addEventListener('DOMContentLoaded', function () {
  const titleScreen = document.getElementById('titleScreen');
  const mainScreen = document.getElementById('mainScreen');
  const titleButton = document.getElementById('titleButton');

  titleButton.addEventListener('click', function () {
      titleScreen.classList.add('hidden');
      mainScreen.classList.remove('hidden');
  });
});
