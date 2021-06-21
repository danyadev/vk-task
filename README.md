# vk-task

Этот репозиторий содержит реализацию тестового задания для стажировки ВКонтакте.

Посмотреть на результат можно [здесь](https://danyadev.github.io/vk-task/).

![image](https://user-images.githubusercontent.com/35631027/122751944-0d4e5a00-d299-11eb-87f4-0f178110cd2d.png)

Реализовано: панель с эмодзи, недавние эмодзи, спрайты для эмодзи, подсветка текста (ссылки, упоминания, хештеги, почта)

## Управление с клавиатуры

- Нажатие на таб открывает или закрывает панель с эмодзи
- В панели эмодзи работает перемещение стрелками и добавление эмодзи по нажатию `Enter`

## Удобство использования

При выводе мыши из панели эмодзи сама панель должна закрываться, что я и сделал.

## Поле для ввода текста

Я добавил максимальную высоту, но при этом убрал скроллбар внутри:
- добавить кастомный скроллбар в данном случае проблематично
- дефолтный скроллбар на винде (где я и сижу) выглядит ужасно

Кнопка для открытия окошка с эмодзи разделяет поле на текст и вертикальную полоску с кнопкой.
Возможно и существует возможность расположить кнопку так, чтобы текст мог быть и под кнопкой
(как показано в фигме), но это наверняка был бы костыль, да и такого функционала я нигде не видел:
в вебе, в мессенджере, в мобильном приложении - везде реализация такая же, как и у меня.

## Кастомный скроллбар

Да, здесь есть даже он. И не какой-то левый модуль, а самописный компонент, который я
реализовал для своего [клиента](https://github.com/danyadev/vk-desktop)!

Здесь использовал немного обрезанную версию: выкинул лишний код и немного поменял стили,
чтобы соответствовать макету и поведению в vk.com.

## Оптимизация рендера эмодзей

Здесь я применил такой же метод, как и в vk.com:
сначала отображается только одна секция, а по мере прокрутки происходит
добавление двух новых.

Однако можно было поступить и по другому. Почему?
* во время добавления новых секций скроллбар прыгает с места на место, что не очень красиво
* добавление новой секции - весьма затратная операция, которая занимает относительно много времени

Здесь хорошо подошел бы виртуальный скролл, однако я еще не занимался таким функционалом,
так что его тут не будет.

## Использование спрайтов для отображения эмодзи

### Способ первый

Он используется в vk.com: добавляем в класс тега `i` hex-код эмодзи и устанавливаем
в стилях все расположения эмодзей в спрайтах.

Данный способ работает неплохо, но вот только css кода при этом оказывается довольно
много - больше 300кб.

### Способ второй

Здесь я использовал этот способ.

Этот способ используется в моем мессенджере: мы генерируем .json файл с
эмодзями и их расположениями в спрайтах. Таким образом можно сократить объем хранимых
данных до менее 100кб. Мне же удалось уместить все
[данные](https://github.com/danyadev/vk-desktop/blob/master/src/js/json/localEmoji.json)
в 61кб, используя небольшой костыль для сжатия.

### Способ третий

Мы можем хранить просто список эмодзей без позиций, ведь мы можем их посчитать самостоятельно!

Все спрайты (кроме последнего) имеют одинаковую высоту и ширину, а последний спрайт на данный
момент содержит 4 эмодзи, которые можно разместить в одной строке.

Зная количество строк и столбцов, мы можем по позиции эмодзи в списке посчитать
номер спрайта, его строку и столбец, и затем уже вычислить координаты в пикселях.

Этот вариант можно считать как доработку второго, ибо мы так же создаем отдельный файл
с эмодзями и гонимся за минимизированием хранимых данных.

Но возможно в плане производительности это будет работать не так хорошо,
ведь нам нужно каждый раз искать эмодзи в гигантском списке и делать небольшие расчеты
либо один раз посчитать абсолютно все координаты и хранить в памяти жирный объект (или мапу).

## Поддержка Safari

На Safari появился баг при попытке добавить эмодзи в текстовое поле:
1) юзер нажимает на эмодзи в панели и сафари меняет selection на него
2) автоматически происходит фокус инпута, но последняя позиция каретки уже потеряна,
поэтому каретка вставляется в самое начало
3) сама эмодзя вставляется уже в начало текстового поля

Из-за отсутствия доступа к самому браузеру я не имею возможности исправить этот баг,
поэтому оставлю все как есть.

Я потратил на попытку исправить этот баг не менее 5 часов...

Плюс, кажется, я поломал работу в Safari слишком навороченным синтаксисом регулярки
для определения ссылок, но опять же, мне не справиться с багами в этом браузере
без доступа к самому браузеру.

## Подсветка различных частей текста в инпуте

Подсветка текста в каком-нибудь блоке - задача довольно простая, однако
подсветка текста в `div contenteditable` - это сущий кошмар...

Мне удалось реализовать рабочий вариант, который заменяет контент только когда
это нужно и сохраняет позицию каретки.

Но это работает не очень стабильно. Зато, как мне кажется, мне удалось написать
довольно читабельный код для этого функционала, что может быть плюсом данной работы.

Сейчас я осознал, что этот функционал - это буквально редактор кода, но изучать это
и переделывать уже слишком поздно.

Для реализации изначально я пытался заменять содержимое инпута на свою сгенерированную
верстку и вместе с этим подсвечивать текст. Но код вышел не очень хорошим,
да и багов было море.

Теперь я отлавливаю измененные/добавленные ноды в поле и перерисовываю только их.
Изначально мне казалось, что это исправит часть проблем, потому что я больше не
меняю весь контент `contenteditable` на свой. Но все оказалось не так просто.

В обоих случах я натыкался на проблемы из-за ужаснейшей генерации контента внутри:
- инпут постоянно меняет способы добавить перенос строки: `<br>`, `<div><br></div>`,
`<div>*content*<br></div>`
- бывало даже так, что `div` вкладывался внутрь `div`
- вместо удаленного подсвеченного текста (`<span class="link">...</span>`)
мог появиться `<font color="...">...</font>`

Я решил оставить код второй реализации, потому что там код гораздо читабельнее,
но если хотите, можете почитать код, который был до коммита `refactor: ...`
