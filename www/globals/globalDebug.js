
document.addEventListener('DOMContentLoaded', function () {
    const themesave = localStorage.getItem('theme');

    setTheme(themesave);

})

////////////// THEME SETTING ///////////////
function setTheme(theme) {
    document.documentElement.classList.remove('white-theme', 'pink-theme', 'blue-theme');
    if (theme === 'white') document.documentElement.classList.add('white-theme');
    else if (theme === 'pink') document.documentElement.classList.add('pink-theme');
    else if (theme === 'blue') document.documentElement.classList.add('blue-theme');
    localStorage.setItem('theme', theme)
}