document.addEventListener('DOMContentLoaded', () => {
  
  // Очистка хэша при перезагрузке страницы
  const navigationEntries = performance.getEntriesByType('navigation');
  if (navigationEntries.length > 0 && navigationEntries[0].type === 'reload') {
    window.location.hash = '';
  };

  // Создание функции задержки
  async function pause(fn, delay) {
    await new Promise(resolve => setTimeout(() => {
      fn();
      resolve();
    }, delay));
  };
  
  // Инициализация ссылки на сервер
  const SERVER_URL = 'http://localhost:3000';

  // Создание константы для таблицы
  const tableBody = document.getElementById('clientsTable-tbody');

  // Создание константы для эффекта затемнения
  const overLay = document.getElementById('overlay');

  // Создание функций для запросов на сервер
  async function serverAddClient(obj) {
    let response = await fetch(SERVER_URL + '/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(obj),
    });
    let data = await response.json();
    return data
  };
  async function serverGetClients() {
    
    // Прелоадер
    const preloader = document.getElementById('preloader');

    // Реализация функции задержки
    await pause(() => {
      preloader.style.display = 'none'
    }, 700);
    
    // Загрузка клиентов с сервера
    let response = await fetch(SERVER_URL + '/api/clients', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    let data = await response.json();
    return data
  };
  async function serverSearchClient(clientSearch) {
    let response = await fetch(SERVER_URL + `/api/clients?search=${clientSearch}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    let data = await response.json();
    return data
  };
  async function serverChangeClientsInfo(id, updatedObj) {
    let response = await fetch(SERVER_URL + `/api/clients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedObj),
    });
    let data = await response.json();
    return data
  };
  async function serverDeleteClient(id) {
      let response = await fetch(SERVER_URL + '/api/clients/' + id, {
        method: 'DELETE',
      });
      let data = await response.json();
      return data;
  };

  // Создание массива клиентов
  let clientsList = [];

  // IIFE функция получения данных клиентов с сервера
  (async function getClientsFromServer() {
    let serverData = await serverGetClients();
    if (serverData) {
      clientsList = serverData;
      renderСlientsTable(clientsList);
    }
    checkHashAndOpenModal();
  })();

  // Создание ссылок на форму модального окна и её элементы
  const modalForm = document.getElementById('addClientModalForm'),
        modalFormHeader = document.getElementById('clientForm__header'),
        modalFormClientsId = document.getElementById('clientForm__clientsId'),
        modalFormInputClientsName = document.getElementById('clientForm__name'),
        modalFormInputClientsSurname = document.getElementById('clientForm__surname'),
        modalFormInputClientsLastname = document.getElementById('clientForm__lastname'),
        modalFormClientsContactContainer = document.getElementById('clientForm__addContactContainer'),
        modalFormAddClientsContactBtn = document.getElementById('clientForm__addContact'),
        modalFormSaveBtn = document.getElementById('clientForm__saveClient'),
        modalFormCloseBtn = document.getElementById('clientForm__closeBtn'),
        modalFormCancelBtn = document.getElementById('clientForm__cancel'),
        modalFormDeleteBtnWhenChange = document.getElementById('clientForm__delete');
        
  const addNewClientBtn = document.getElementById('addNewClientBtn');

  // Подключение фреймворка валидации формы
  const validation = new JustValidate('#addClientModalForm', {
    errorLabelStyle: {
      color: 'red'
    }
  });
  validation
  .addField('#clientForm__name', [
    {
      rule: 'required',
      errorMessage: 'Поле обязательно для заполнения'
    },
    {
      rule: 'minLength',
      value: 3,
      errorMessage: 'Минимум 3 символа'
    },
    {
      rule: 'maxLength',
      value: 15,
      errorMessage: 'Максимум 15 символов'
    },
    {
      rule: 'customRegexp',
      value: /[а-я]/gi,
      errorMessage: 'Ошибка, введите текст кириллицей (А-Я)'
    }
  ])
  .addField('#clientForm__surname', [
    {
      rule: 'customRegexp',
      value: /[а-я]/gi,
      errorMessage: 'Ошибка, введите текст кириллицей (А-Я)'
    }
  ])
  .addField('#clientForm__lastname', [
    {
      rule: 'required',
      errorMessage: 'Поле обязательно для заполнения'
    },
    {
      rule: 'minLength',
      value: 3,
      errorMessage: 'Минимум 3 символа'
    },
    {
      rule: 'maxLength',
      value: 15,
      errorMessage: 'Максимум 15 символов'
    },
    {
      rule: 'customRegexp',
      value: /[а-я]/gi,
      errorMessage: 'Ошибка, введите текст кириллицей (А-Я)'
    }
  ]);

  // Константы для формы удаления клиента
  const modalFormDelete = document.getElementById('deleteClientModalForm'),
        modalFormDeleteBtn = document.getElementById('clientForm__deleteClient'),
        modalFormDeleteCloseBtn = document.getElementById('clientForm__closeBtnDelete'),
        modalFormDeleteCancelBtn = document.getElementById('clientForm__cancelDelete');

  modalFormCancelBtn.addEventListener('click', cancelFunction);

  // Создание константы для кнопки копирования ссылки на клиента
  const hashCopyBtn = document.getElementById('hashCopyBtn');

  // Программирование кнопки удалить клиента в форме "Изменить"
  modalFormDeleteBtnWhenChange.addEventListener('click', function(event) {
    event.preventDefault();
    modalFormDelete.classList.add('appearance-effect-on');
    modalForm.classList.remove('appearance-effect-on');
  });

  // Функция добавления клиента в базу данных
  function createNewClientTr(clientObj) {

    // Создание строки и ячеек для добавления информации о клиенте
    const clientTr = document.createElement('tr'),
          clientTdId = document.createElement('td'),
          clientTdFio = document.createElement('td'),
          clientTdCreatedAt = document.createElement('td'),
          clientTdCreatedAtDateSpan = document.createElement('span'),
          clientTdCreatedAtTimeSpan = document.createElement('span'),
          clientTdUpdatedAt = document.createElement('td'),
          clientTdUpdatedAtDateSpan = document.createElement('span'),
          clientTdUpdatedAtTimeSpan = document.createElement('span'),
          clientTdContacts = document.createElement('td'),
          clientTdContactsContainer = document.createElement('div'),
          clientTdActions = document.createElement('td');

    // Стилизация строки и ячеек таблицы
    clientTr.classList.add('main__clientTr');
    clientTdId.classList.add('main__clientTd', 'main__client-id');
    clientTdFio.classList.add('main__clientTd');
    clientTdContacts.classList.add('main__clientTdContacts');
    clientTdCreatedAt.classList.add('main__clientTd');
    clientTdUpdatedAt.classList.add('main__clientTd');
    clientTdContactsContainer.classList.add('main__clientTd', 'main__client-contactsTd-Container');
    clientTdActions.classList.add('main__clientTd', 'main__clientTdActions');
    
    // Наполнение контентом ячейки айди
    clientTdId.textContent = clientObj.id;

    // Наполнение контентом ячейки ФИО
    clientTdFio.textContent = clientObj.lastName + " " + clientObj.name + " " + clientObj.surname;

    // Наполнение контентом текстовый спан с датой
    clientTdCreatedAtDateSpan.textContent = convertDateFormat(clientObj.createdAt) + ' ';
    clientTdCreatedAtDateSpan.classList.add('main__client-span-date');
    clientTdCreatedAtTimeSpan.textContent = convertTimeFormat(clientObj.createdAt);
    clientTdCreatedAtTimeSpan.classList.add('main__client-span-time');
    clientTdCreatedAt.append(clientTdCreatedAtDateSpan, clientTdCreatedAtTimeSpan);
    
    // Наполнение контентом текстовый спан с датой
    clientTdUpdatedAtDateSpan.textContent = convertDateFormat(clientObj.updatedAt) + ' ';
    clientTdUpdatedAtDateSpan.classList.add('main__client-span-date');
    clientTdUpdatedAtTimeSpan.textContent = convertTimeFormat(clientObj.updatedAt);
    clientTdUpdatedAtTimeSpan.classList.add('main__client-span-time');
    clientTdUpdatedAt.append(clientTdUpdatedAtDateSpan, clientTdUpdatedAtTimeSpan);
    
    if (Array.isArray(clientObj.contacts)) {
      addContacts(clientObj.contacts, clientTdContactsContainer);
    } else {
      console.log('Контакты не найдены или не являются массивом', clientObj);
    }
    clientTdContacts.append(clientTdContactsContainer);
    
    // Программирование кнопки "изменить"
    const clientChangeBtn = document.createElement('button');
    clientChangeBtn.textContent = 'Изменить';
    clientChangeBtn.classList.add('btn', 'main__clientChangeBtn');
    clientChangeBtn.id = 'clientChangeBtnID' + clientObj.id;
    
    const clientChangeBtnPreloader = document.createElement('div');
    clientChangeBtnPreloader.classList.add('main__clientChangeBtn-picture');
    clientChangeBtnPreloader.id = 'clientChangeBtnPreloader' + clientObj.id;
    
    clientChangeBtn.before(clientChangeBtnPreloader);
    
    clientChangeBtn.addEventListener('click', async function(event) {
      event.preventDefault();

      clientChangeBtnPreloader.classList.remove('main__clientChangeBtn-picture');
      clientChangeBtnPreloader.classList.add('main__clientChangeBtn-preloader');

      // Реализация функции задержки
      await pause(() => {
        clientChangeBtnPreloader.classList.add('main__clientChangeBtn-picture');
        clientChangeBtnPreloader.classList.remove('main__clientChangeBtn-preloader');
      }, 500);
      
      openClientModal(clientObj.id);
    });
    
    // Программирование кнопки "удалить"
    clientDeleteBtn = document.createElement('button');
    clientDeleteBtn.textContent = 'Удалить';
    clientDeleteBtn.classList.add('btn', 'main__clientDeleteBtn');
    clientDeleteBtn.addEventListener('click', function(event) {
      modalFormClientsId.textContent = `ID: ${clientObj.id}`;
      
      modalFormDelete.classList.add('appearance-effect-on');
      document.body.classList.add('stop-scroll');
      overLay.style.display = 'block';
    });

    // Добавление кнопок в ячейку действий
    clientTdActions.append(clientChangeBtnPreloader, clientChangeBtn, clientDeleteBtn);

    // Добавление в строку созданных ячеек
    clientTr.append(clientTdId, clientTdFio, clientTdCreatedAt, clientTdUpdatedAt, clientTdContacts, clientTdActions);

    // Вывод строки с информацией о клиенте
    return clientTr
  };

  // Функция добавления иконок контактов в соответствующее поле
  function addContacts(contacts, contactsContainer) {
    for (let contact of contacts) {
      const tooltipContent = `${contact.type}: ${contact.value}`;
      if (contact.type === 'Телефон' || contact.type === 'Доп. телефон') {
        const contSpanPhone = document.createElement('button');
        contSpanPhone.classList.add('btn', 'contact-icon', 'main__contact-icon-phone');
        tippy(contSpanPhone, {
          content: tooltipContent,
        });
        contactsContainer.append(contSpanPhone);
      } else if (contact.type === 'Email') {
        const contSpanEmail = document.createElement('button');
        contSpanEmail.classList.add('btn', 'contact-icon', 'main__contact-icon-email');
        tippy(contSpanEmail, {
          content: tooltipContent,
        });
        contactsContainer.append(contSpanEmail);
      } else if (contact.type === 'Vk') {
        const contSpanVK = document.createElement('button');
        contSpanVK.classList.add('btn', 'contact-icon', 'main__contact-icon-vk');
        tippy(contSpanVK, {
          content: tooltipContent,
        });
        contactsContainer.append(contSpanVK);
      } else if (contact.type === 'Facebook') {
        const contSpanFacebook = document.createElement('button');
        contSpanFacebook.classList.add('btn', 'contact-icon', 'main__contact-icon-fb');
        tippy(contSpanFacebook, {
          content: tooltipContent,
        });
        contactsContainer.append(contSpanFacebook);
      } else if (contact.type === 'Другое') {
        const contSpanAnother = document.createElement('button');
        contSpanAnother.classList.add('btn', 'contact-icon', 'main__contact-icon-another');
        tippy(contSpanAnother, {
          content: tooltipContent,
        });
        contactsContainer.append(contSpanAnother);
      };
    };
    
    let contactArr = contactsContainer.querySelectorAll('.contact-icon');
    let contactArray = Array.from(contactArr);

    if (contactArray.length > 5) {

      const extraContacts = contactArray.splice(5);
      extraContacts.forEach((extraContact) => {
        extraContact.classList.add('main__contact-icon-hidden');
      });

      const contSpanHidden = document.createElement('button');
      contSpanHidden.textContent = '+' + extraContacts.length;
      contSpanHidden.classList.add('btn', 'main__contact-icon-counter');
      contSpanHidden.addEventListener('click', function() {
        extraContacts.forEach((extraContact) => {
          extraContact.classList.remove('main__contact-icon-hidden');
        });
        contSpanHidden.classList.add('main__contact-icon-hidden');
      });
      contactsContainer.append(contSpanHidden);
    };
  };
  
  // Функция добавления полей контактов в модальном окне
  function addContactFieldFunction(existingContact = null) {
    // Создание селекта и его опций
    const contactSelect = document.createElement('select');
    contactSelect.classList.add('main__contactSelect', 'js-choice');
    contactSelect.setAttribute('name', 'Контактные данные');

    const contactOptionPhone = document.createElement('option');
    contactOptionPhone.value = 'Телефон';
    contactOptionPhone.textContent = 'Телефон';

    const contactOptionAdditionalPhone = document.createElement('option');
    contactOptionAdditionalPhone.value = 'Доп. телефон';
    contactOptionAdditionalPhone.textContent = 'Доп. телефон';

    const contactOptionEmail = document.createElement('option');
    contactOptionEmail.value = 'Email';
    contactOptionEmail.textContent = 'Email';

    const contactOptionSocialVK = document.createElement('option');
    contactOptionSocialVK.value = 'Vk';
    contactOptionSocialVK.textContent = 'Vk';

    const contactOptionSocialFacebook = document.createElement('option');
    contactOptionSocialFacebook.value = 'Facebook';
    contactOptionSocialFacebook.textContent = 'Facebook';

    const contactOptionSocialAnother = document.createElement('option');
    contactOptionSocialAnother.value = 'Другое';
    contactOptionSocialAnother.textContent = 'Другое';

    // Добавление опций в селект
    contactSelect.append(
      contactOptionPhone, 
      contactOptionAdditionalPhone, 
      contactOptionEmail, 
      contactOptionSocialVK, 
      contactOptionSocialFacebook, 
      contactOptionSocialAnother
    );

    // Создание поля ввода данных контакта
    const contactInput = document.createElement('input');
    contactInput.classList.add('main__contactInput');
    contactInput.placeholder = 'Введите данные контакта';

    // Создание кнопки удалить контакт
    const contactDeleteBtn = document.createElement('button');
    contactDeleteBtn.classList.add('main__contactDelBtn');
    contactDeleteBtn.addEventListener('click', function (event) {
      event.preventDefault();
      contactContainer.remove();
    });

    // Если переданы существующие данные контакта, устанавливаем их
    if (existingContact) {
      contactSelect.value = existingContact.type;
      contactInput.value = existingContact.value;
    };

    const contactContainer = document.createElement('div');
    contactContainer.classList.add('main__contact-container');
    contactContainer.append(contactSelect, contactInput, contactDeleteBtn);

    // Кастомизация селекта
    const choices = new Choices(contactSelect, {
      searchEnabled: false,
      allowHTML: true
    });

    return contactContainer
  };

  // Функция проверки лимита контактов клиента
  function checkContactLimit(contactsContainer) {
    let contactArr = contactsContainer.querySelectorAll('.main__contact-container');
    let contactCount = contactArr.length;
    
    if (contactCount > 0) {
      modalFormClientsContactContainer.classList.add('clientForm__addContact-container');
    } else if (contactCount = 0) {
      modalFormClientsContactContainer.classList.remove('clientForm__addContact-container');
      modalFormClientsContactContainer.classList.remove('clientForm__addContact-container-tableclass');
    } else if (0 < contactCount < 5) {
      modalFormClientsContactContainer.classList.remove('clientForm__addContact-container-tableclass');
    }
    
    if (contactCount >= 5) {
      modalFormClientsContactContainer.classList.remove('clientForm__addContact-container');
      modalFormClientsContactContainer.classList.add('clientForm__addContact-container-tableclass');
    }
    
    if (contactCount >= 10) {
      modalFormAddClientsContactBtn.disabled = true;
    } else {
      modalFormAddClientsContactBtn.disabled = false;
    }
  }
  
  // Функция добавления полей контактов в модальном окне для существующего клиента
  function createExistingContactAddField(contact) {
    const existingContactField = addContactFieldFunction(contact);
    modalFormClientsContactContainer.append(existingContactField);
    checkContactLimit(modalFormClientsContactContainer);
  };

  // Функция форматирования даты
  function convertDateFormat(someDate) {

    // Создаем объект Date из входной строки
    let date = new Date(someDate);
    
    // Создание констант для даты создания записи
    const dateYear = date.getFullYear(),
          dateMonth = date.getMonth() + 1,
          dateDay = date.getDate();

    const formattedDate = `${String(dateDay).padStart(2, '0')}.${String(dateMonth).padStart(2, '0')}.${dateYear}`;

    // Вывод форматированной информации
    return formattedDate
  };

  // Функция форматирования времени
  function convertTimeFormat(someDate) {

    // Создаем объект Date из входной строки
    let date = new Date(someDate);
    
    // Создание констант для даты создания записи
    const dateHour = date.getHours(),
          dateMin = date.getMinutes();

    const formattedTime = `${String(dateHour).padStart(2, '0')}:${String(dateMin).padStart(2, '0')}`;

    // Вывод форматированной информации
    return formattedTime
  };

  // Функция отрисовки таблицы клиентов
  async function renderСlientsTable(someList) {

    // Создание копии массива студентов
    let copyСlientsList = [...someList];

    tableBody.innerHTML = '';

    // Создание цикла отрисовки строки с данными студента в таблицу
    for (let client of copyСlientsList) {
      const newRow = createNewClientTr(client);
      tableBody.append(newRow);
    };
  };

  // Функция отмены для соответствующей кнопки
  function cancelFunction(event) {
    event.preventDefault();
    
    modalFormInputClientsName.value = '';
    modalFormInputClientsSurname.value = '';
    modalFormInputClientsLastname.value = '';

    const contactContainers = document.querySelectorAll('.main__contact-container');
    contactContainers.forEach(function(contactElement) {
      contactElement.remove();
    });
    
    modalFormClientsContactContainer.classList.remove('clientForm__addContact-container');
    modalFormClientsContactContainer.classList.remove('clientForm__addContact-container-tableclass');
    
    window.location.hash = '';
    
    modalForm.classList.remove('appearance-effect-on');
    document.body.classList.remove('stop-scroll');
    overLay.style.display = 'none';
  };

  // Функция валидации ФИО
  function isValidCyrillicText(text) {
    const cyrillicPattern = /^[а-яА-ЯёЁ\s]+$/;
    return cyrillicPattern.test(text);
  }
  
  // Функция сохранения для соответствующей кнопки
  async function saveFunction() {
    
    // Валидация формы клиента - количество символов
    const inputNameLength = modalFormInputClientsName.value.length;
    const inputLastNameLength = modalFormInputClientsLastname.value.length;
    if (inputNameLength < 3 || inputLastNameLength < 3) {
      return
    } else if (inputNameLength < 3 && inputLastNameLength < 3) {
      return
    } else if (inputNameLength > 15 || inputLastNameLength > 15) {
      return
    } else if (inputNameLength > 15 && inputLastNameLength > 15) {
      return
    };

    const client = {};

    if (modalFormClientsId.textContent) {

      client.id = parseInt(modalFormClientsId.textContent.substring(4));
      
      if (!isValidCyrillicText(modalFormInputClientsName.value)) {
        return
      } else if (!isValidCyrillicText(modalFormInputClientsLastname.value)) {
        return
      } else if (!isValidCyrillicText(modalFormInputClientsSurname.value)) {
        return
      }
      client.lastName = modalFormInputClientsLastname.value;
      client.name = modalFormInputClientsName.value;
      client.surname = modalFormInputClientsSurname.value;
      client.contacts = [];

      const contactContainers = document.querySelectorAll('.main__contact-container');
      contactContainers.forEach(function(contactContainer) {
        const contactSelect = contactContainer.querySelector('.main__contactSelect');
        const contactInput = contactContainer.querySelector('.main__contactInput');
        const selectedOption = contactSelect.value;
        const inputValue = contactInput.value;
        client.contacts.push({ type: selectedOption, value: inputValue });
      });

      const updatedClient = await serverChangeClientsInfo(client.id, client);

      const clientIndex = clientsList.findIndex(c => parseInt(c.id) === client.id);
      
      if (clientIndex !== -1) {
        clientsList[clientIndex] = updatedClient;
      };
      renderСlientsTable(clientsList);
    } else {
      if (!isValidCyrillicText(modalFormInputClientsName.value)) {
        return
      } else if (!isValidCyrillicText(modalFormInputClientsLastname.value)) {
        return
      } else if (!isValidCyrillicText(modalFormInputClientsSurname.value)) {
        return
      }
      client.lastName = modalFormInputClientsLastname.value;
      client.name = modalFormInputClientsName.value;
      client.surname = modalFormInputClientsSurname.value;
      client.contacts = [];

      const contactContainers = document.querySelectorAll('.main__contact-container');
      contactContainers.forEach((contactContainer) => {
        const contactSelect = contactContainer.querySelector('.main__contactSelect');
        const contactInput = contactContainer.querySelector('.main__contactInput');
        const selectedOption = contactSelect.value;
        const inputValue = contactInput.value;
        client.contacts.push({ type: selectedOption, value: inputValue });
      });

      const addedClient = await serverAddClient(client);

      clientsList.push(addedClient);
      renderСlientsTable(clientsList);
    }

    // Очистка полей модального окна
    modalFormInputClientsName.value = '';
    modalFormInputClientsSurname.value = '';
    modalFormInputClientsLastname.value = '';
    const contactContainers = document.querySelectorAll('.main__contact-container');
    contactContainers.forEach((contactElement) => {
      contactElement.remove();
    });

    // Очистка хэша
    window.location.hash = '';

    // Закрытие модального окна
    modalForm.classList.remove('appearance-effect-on');
    document.body.classList.remove('stop-scroll');
    overLay.style.display = 'none';
  };

  // Слушатель для кнопки "Удалить" в модальном окне удаления клиента
  modalFormDeleteBtn.addEventListener('click', async function (event) {
    event.preventDefault();

    const client = {};
    
    if (modalFormClientsId.textContent) {
      client.id = parseInt(modalFormClientsId.textContent.substring(4));
      client.name = modalFormInputClientsName.value;
      client.surname = modalFormInputClientsSurname.value;
      client.lastName = modalFormInputClientsLastname.value;
      client.contacts = [];

      const contactContainers = document.querySelectorAll('.main__contact-container');
      contactContainers.forEach(function(contactContainer) {
        const contactSelect = contactContainer.querySelector('.main__contactSelect');
        const contactInput = contactContainer.querySelector('.main__contactInput');
        const selectedOption = contactSelect.value;
        const inputValue = contactInput.value;
        client.contacts.push({ type: selectedOption, value: inputValue });
      });
    } else {
      client.id = parseInt(modalFormClientsId.textContent.substring(4));
      client.name = modalFormInputClientsName.value;
      client.surname = modalFormInputClientsSurname.value;
      client.lastName = modalFormInputClientsLastname.value;
      client.contacts = [];

      const contactContainers = document.querySelectorAll('.main__contact-container');
      contactContainers.forEach((contactContainer) => {
        const contactSelect = contactContainer.querySelector('.main__contactSelect');
        const contactInput = contactContainer.querySelector('.main__contactInput');
        const selectedOption = contactSelect.value;
        const inputValue = contactInput.value;
        client.contacts.push({ type: selectedOption, value: inputValue });
      });
    };

    const clientIndexToDelete = clientsList.findIndex(c => parseInt(c.id) === client.id);
    if (clientIndexToDelete > -1) {
      clientsList.splice(clientIndexToDelete, 1);
    };
    
    await serverDeleteClient(client.id);
    renderСlientsTable(clientsList);

    modalFormClientsId.value = '';
    modalFormInputClientsName.value = '';
    modalFormInputClientsSurname.value = '';
    modalFormInputClientsLastname.value = '';
    const contactContainers = document.querySelectorAll('.main__contact-container');
    contactContainers.forEach(function(contactElement) {
      contactElement.remove();
    });

    window.location.hash = '';
    
    modalFormDelete.classList.remove('appearance-effect-on');
    document.body.classList.remove('stop-scroll');
    overLay.style.display = 'none';
  });

  // Слушатель для кнопки "Добавить клиента"
  addNewClientBtn.addEventListener('click', function(event) {
    event.preventDefault();

    modalFormHeader.textContent = 'Новый клиент';
    modalFormClientsId.textContent = '';
    modalFormInputClientsName.value = '';
    modalFormInputClientsSurname.value = '';
    modalFormInputClientsLastname.value = '';

    const contactContainers = document.querySelectorAll('.main__contact-container');
    contactContainers.forEach((contactElement) => {
      contactElement.remove();
    });

    modalFormAddClientsContactBtn.disabled = false;
    
    modalFormDeleteBtnWhenChange.classList.add('visible-state-off');
    modalFormCancelBtn.classList.remove('visible-state-off');
    
    modalFormClientsContactContainer.classList.remove('clientForm__addContact-container');
    modalFormClientsContactContainer.classList.remove('clientForm__addContact-container-tableclass');

    window.location.hash = '';
    hashCopyBtn.style.display = 'none';
    
    modalForm.classList.add('appearance-effect-on');
    document.body.classList.add('stop-scroll');
    overLay.style.display = 'block';
  });
  
  // Слушатель для кнопки "Сохранить"
  modalFormSaveBtn.addEventListener('click', saveFunction);
  
  // Слушатель для кнопки Enter в модальном окне
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      saveFunction();
    }
  });

  // Слушатель для кнопки "Добавить контакт"
  modalFormAddClientsContactBtn.addEventListener('click', function(event) {
    event.preventDefault();
    modalFormClientsContactContainer.append(addContactFieldFunction());
    checkContactLimit(modalFormClientsContactContainer);
  });

  // Слушатель для кнопки "Закрыть" (крестик) в модальном окне
  modalFormCloseBtn.addEventListener('click', function(event) {
    event.preventDefault();
    
    modalFormInputClientsName.value = '';
    modalFormInputClientsSurname.value = '';
    modalFormInputClientsLastname.value = '';

    const contactContainers = document.querySelectorAll('.main__contact-container');
    contactContainers.forEach(function(contactElement) {
      contactElement.remove();
    });
    
    modalFormClientsContactContainer.classList.remove('clientForm__addContact-container');
    modalFormClientsContactContainer.classList.remove('clientForm__addContact-container-tableclass');

    window.location.hash = '';
    
    modalForm.classList.remove('appearance-effect-on');
    document.body.classList.remove('stop-scroll');
    overLay.style.display = 'none';
  });

  // Слушатель для кнопки "Закрыть" (крестик) в модальном окне удаления
  modalFormDeleteCloseBtn.addEventListener('click', function(event) {
    event.preventDefault();
    modalFormDelete.classList.add('visible-state-off');
    document.body.classList.remove('stop-scroll');
    overLay.style.display = 'none';
  });
  
  // Слушатель для кнопки "Отмена" в модальном окне удаления
  modalFormDeleteCancelBtn.addEventListener('click', function(event) {
    event.preventDefault();
    modalFormDelete.classList.add('visible-state-off');
    document.body.classList.remove('stop-scroll');
    overLay.style.display = 'none';
  });

  // СОРТИРОВКА НАЧАЛО
  // Направление сортировки, по умолчанию - по возрастанию
  let isAscending = true;

  const tableHeadThID = document.getElementById('clientsTableID'),
        tableHeadThFio = document.getElementById('clientsTableFIO'),
        tableHeadThCreatedAt = document.getElementById('clientsTableCreatedAt'),
        tableHeadThUpdatedAt = document.getElementById('clientsTableUpdatedAt');

  const tableThSortIconID = document.getElementById('sortIconID'),
        tableThSortIconFIO = document.getElementById('sortIconFIO'),
        tableThSortIconCreatedAt = document.getElementById('sortIconCreatedAt'),
        tableThSortIconUpdatedAt = document.getElementById('sortIconUpdatedAt');

  // Создание обработчиков событий для сортировки столбцов
  tableHeadThID.addEventListener('click', () => {
    clientSort(clientsList, 'id');
    if (isAscending) {
      tableThSortIconID.classList.add('sort-down');
      tableThSortIconID.classList.remove('sort-up');
    } else {
      tableThSortIconID.classList.remove('sort-down');
      tableThSortIconID.classList.add('sort-up');
    }
  });
  tableHeadThFio.addEventListener('click', () => {
    clientSort(clientsList, 'name');
    if (isAscending) {
      tableThSortIconFIO.classList.add('sort-down');
      tableThSortIconFIO.classList.remove('sort-up');
    } else {
      tableThSortIconFIO.classList.remove('sort-down');
      tableThSortIconFIO.classList.add('sort-up');
    }
    // Переключение алфавитного индикатора при изменении сортировки
    const sortIndicator = document.getElementById('sort-indicator-FIO');
    sortIndicator.textContent = isAscending ? 'А-Я' : 'Я-А';
  });
  tableHeadThCreatedAt.addEventListener('click', () => {
    clientSort(clientsList, 'createdAt');
    if (isAscending) {
      tableThSortIconCreatedAt.classList.add('sort-down');
      tableThSortIconCreatedAt.classList.remove('sort-up');
    } else {
      tableThSortIconCreatedAt.classList.remove('sort-down');
      tableThSortIconCreatedAt.classList.add('sort-up');
    }
  });
  tableHeadThUpdatedAt.addEventListener('click', () => {
    clientSort(clientsList, 'updatedAt');
    if (isAscending) {
      tableThSortIconUpdatedAt.classList.add('sort-down');
      tableThSortIconUpdatedAt.classList.remove('sort-up');
    } else {
      tableThSortIconUpdatedAt.classList.remove('sort-down');
      tableThSortIconUpdatedAt.classList.add('sort-up');
    }
  });

  // Функция сортировки списка клиентов
  function clientSort(arr, sortType) {
    if (isAscending) {
      arr.sort((a, b) => {
        if (sortType === 'name') {
          let fullNameA = `${a.lastName} ${a.name} ${a.surname}`.toUpperCase();
          let fullNameB = `${b.lastName} ${b.name} ${b.surname}`.toUpperCase();
          return fullNameA < fullNameB ? -1 : fullNameA > fullNameB ? 1 : 0;
        } else if (sortType === 'id') {
          return a.id.toUpperCase() < b.id.toUpperCase() ? -1 : a.id.toUpperCase() > b.id.toUpperCase() ? 1 : 0;
        } else if (sortType === 'createdAt' || sortType === 'updatedAt') {
          return new Date(a[sortType]) - new Date(b[sortType]);
        }
      });
    } else {
      arr.sort((a, b) => {
        if (sortType === 'name') {
          let fullNameA = `${a.lastName} ${a.name} ${a.surname}`.toUpperCase();
          let fullNameB = `${b.lastName} ${b.name} ${b.surname}`.toUpperCase();
          return fullNameA > fullNameB ? -1 : fullNameA < fullNameB ? 1 : 0;
        } else if (sortType === 'id') {
          return a.id.toUpperCase() > b.id.toUpperCase() ? -1 : a.id.toUpperCase() < b.id.toUpperCase() ? 1 : 0;
        } else if (sortType === 'createdAt' || sortType === 'updatedAt') {
          return new Date(b[sortType]) - new Date(a[sortType]);
        }
      });
    };
    isAscending = !isAscending;
    renderСlientsTable(arr);
  };
  // СОРТИРОВКА КОНЕЦ

  // Программирование поля поиска НАЧАЛО
  let searchInput = document.getElementById('searchInput');
  let debounceTimer;

  searchInput.addEventListener('input', function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      performSearch(searchInput.value);
    }, 300);
  });

  async function performSearch(query) {
    // Выполнение запроса к API с поисковым запросом
    let searchResults = await serverSearchClient(query);
    let copylist = [];
    for (client of searchResults) {
      copylist.push(client);
    }
    // Отрисовка результатов поиска в таблице (написать функцию для этого)
    renderСlientsTable(copylist);
  };
  // Программирование поля поиска КОНЕЦ

  // Функция проверки hash и открытия модального окна соответствующего клиента
  function checkHashAndOpenModal() {
    
    const hash = window.location.hash;

    if (hash.startsWith('#client-')) {
        const clientId = hash.split('-')[1];
        openClientModal(clientId);
    }
  };
  
  // Слушатель для события hashchange
  window.addEventListener('hashchange', checkHashAndOpenModal);

  // Функция открытия модального окна 
  async function openClientModal(clientId) {
    clientId = String(clientId);
    
    if (!clientsList || clientsList.length === 0) {
      console.error('Список клиентов не загружен или пуст');
      return;
    }
    
    const clientData = (clientsList.filter(client => client.id === clientId))[0];
    
    if (clientData) {
      
      modalFormDeleteBtnWhenChange.classList.remove('visible-state-off');
      modalFormCancelBtn.classList.add('visible-state-off');
      
      modalFormHeader.textContent = 'Изменить данные';
      modalFormClientsId.textContent = `ID: ${clientData.id}`;
      modalFormInputClientsName.value = clientData.name;
      modalFormInputClientsSurname.value = clientData.surname;
      modalFormInputClientsLastname.value = clientData.lastName;
      
      modalFormClientsContactContainer.innerHTML = '';
      clientData.contacts.forEach(contact => createExistingContactAddField(contact));

      // Сохранение хэша клиента
      window.location.hash = '#client-' + clientData.id;
      hashCopyBtn.style.display = 'inline-block';
      
      // Отображение модального окна
      modalForm.classList.add('appearance-effect-on');
      document.body.classList.add('stop-scroll');
      overLay.style.display = 'block';

    } else {
      console.error('Не удалось загрузить данные клиента с ID:', clientId);
    }
  };

  // Слушатель для кнопки скопировать ссылку на клиента
  hashCopyBtn.addEventListener('click', async () => {
    const path = window.location.href;
    
    // Копирование пути в буфер обмена
    await navigator.clipboard.writeText(path);
    alert('Ссылка скопирована в буфер обмена!');
  });
});