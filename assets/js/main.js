//------ Modal ----------------------------------
const addButton = document.getElementById('add-button');
const inputModal = document.getElementById('input-modal');
const inputClose = document.getElementById('input-close');
const inputDialog = document.getElementById('input-dialog');
const inputDialogButton = document.getElementById('input-dialog-button');
const deleteDialog = document.getElementById('delete-dialog');
const deleteButtonYes = document.getElementById('delete-button-yes');
const deleteButtonNo = document.getElementById('delete-button-no');

addButton.addEventListener('click', () => {
    inputModal.classList.add('active-modal');
});

inputClose.addEventListener('click', () => {
    inputModal.classList.remove('active-modal');
});


//------ Upload Button ----------------------------------
const uploadButton = document.getElementById('upload-image');
const customUploadButton = document.getElementById('custom-upload-button');

customUploadButton.addEventListener('click', () => {
    uploadButton.click();
})

uploadButton.addEventListener('change', () => {
    if (uploadButton.value) {
        const path = uploadButton.value;
        const filename = path.replace(/^.*\\/, "");
        customUploadButton.innerHTML = filename;
    } else {
        customUploadButton.innerHTML = "Belum ada gambar yang dipilih";
    }
})


//----------------------------------------

let bookObject = {};
const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF__APP';

document.addEventListener('DOMContentLoaded', () => {
    const submitForm = document.getElementById('input-form');
    submitForm.addEventListener('submit', (event) => {
        event.preventDefault();

        addBook();
        inputModal.classList.remove('active-modal');
        inputDialog.classList.add('active-modal');

        inputDialogButton.addEventListener('click', () => {
            inputDialog.classList.remove('active-modal');
        });

        submitForm.reset();
        customUploadButton.innerHTML = "Upload Gambar Buku";

    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

function addBook() {

    const bookTitle = document.getElementById('input-book-title').value;
    const bookAuthor = document.getElementById('input-book-author').value;
    const bookYear = document.getElementById('input-book-year').value;

    const isRead = isChecked();

    const generatedId = generateId();

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    const uploadedFile = document.querySelector('#upload-image').files[0];
    toBase64(uploadedFile)
        .then(resolve => {
            const bookImage = resolve;

            const newBookObject = Object.create(bookObject);

            newBookObject.id = generatedId;
            newBookObject.title = bookTitle;
            newBookObject.author = bookAuthor;
            newBookObject.year = bookYear;
            newBookObject.isRead = isRead;
            newBookObject.image = bookImage;

            books.push(newBookObject);
            document.dispatchEvent(new Event(RENDER_EVENT));
            saveData();
        })
        .catch(error => {
            console.log(error);
        })
}

function generateId() {
    return +new Date();
}

function isChecked() {
    const checkboxIsRead = document.getElementById('checkbox-is-read');

    if (checkboxIsRead.checked) {
        return true;
    } else {
        return false;
    }
}

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser Anda tidak mendukung local storage');
        return false;
    }
    return true;
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

document.addEventListener(RENDER_EVENT, () => {
    const unreadBookshelf = document.getElementById('unread-bookshelf-wrapper');
    unreadBookshelf.innerHTML = '';

    const readBookshelf = document.getElementById('read-bookshelf-wrapper');
    readBookshelf.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBookList(bookItem);
        if (!bookItem.isRead) {
            unreadBookshelf.append(bookElement);
        } else {
            readBookshelf.append(bookElement);
        }
    }
})

function makeBookList(bookObject) {
    const textTitle = document.createElement('h4');
    textTitle.classList.add('book__title');
    textTitle.innerText = bookObject.title;

    const textAuthor = document.createElement('p');
    textAuthor.classList.add('book__author');
    textAuthor.innerText = bookObject.author;

    const textYear = document.createElement('p');
    textYear.classList.add('book__year');
    textYear.innerText = bookObject.year;

    const bookDescription = document.createElement('div');
    bookDescription.classList.add('book__description');
    bookDescription.append(textTitle, textAuthor, textYear);

    const bookImage = document.createElement('img');
    bookImage.classList.add('book__img');
    bookImage.setAttribute('src', bookObject.image);
    bookImage.setAttribute('alt', 'Gambar Buku');

    const bookContent = document.createElement('div');
    bookContent.classList.add('book__content');
    bookContent.append(bookImage, bookDescription);

    const bookContainer = document.createElement('article');
    bookContainer.classList.add('card', 'swiper-slide', 'book__item');
    bookContainer.append(bookContent);

    bookContainer.setAttribute('id', `book-${bookObject.id}`)

    if (bookObject.isRead) {
        const unreadButton = document.createElement('button');
        unreadButton.classList.add('primary__button', 'unread__button');
        unreadButton.innerText = "Belum Dibaca";

        unreadButton.addEventListener('click', () => {
            undoBookFromRead(bookObject.id);
        })

        const deleteButton = document.createElement('button')
        deleteButton.classList.add('delete__button');

        const deleteIcon = document.createElement('i');
        deleteIcon.classList.add('bx', 'bxs-trash')

        deleteButton.append(deleteIcon);

        deleteButton.addEventListener('click', () => {
            deleteDialog.classList.add('active-modal');

            deleteButtonYes.addEventListener('click', () => {
                deleteBook(bookObject.id);
                deleteDialog.classList.remove('active-modal');
            })

            deleteButtonNo.addEventListener('click', () => {
                deleteDialog.classList.remove('active-modal');
            })
        })

        const bookButton = document.createElement('div');
        bookButton.classList.add('book__button');
        bookButton.append(unreadButton, deleteButton);

        bookContainer.append(bookButton);
    } else {
        const readButton = document.createElement('button');
        readButton.classList.add('primary__button', 'read__button');
        readButton.innerText = "Sudah Dibaca";

        readButton.addEventListener('click', () => {
            addBookToRead(bookObject.id);
        })

        const deleteButton = document.createElement('button')
        deleteButton.classList.add('delete__button');

        const deleteIcon = document.createElement('i');
        deleteIcon.classList.add('bx', 'bxs-trash')

        deleteButton.append(deleteIcon);

        deleteButton.addEventListener('click', () => {
            deleteDialog.classList.add('active-modal');

            deleteButtonYes.addEventListener('click', () => {
                deleteBook(bookObject.id);
                deleteDialog.classList.remove('active-modal');
            })

            deleteButtonNo.addEventListener('click', () => {
                deleteDialog.classList.remove('active-modal');
            })
        })

        const bookButton = document.createElement('div');
        bookButton.classList.add('book__button');
        bookButton.append(readButton, deleteButton);

        bookContainer.append(bookButton);
    }

    return bookContainer;
}

function addBookToRead(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isRead = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoBookFromRead(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isRead = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function deleteBook(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData();
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

//------ Search ----------------------------------
const searchInput = document.querySelector('#search-input');
searchInput.addEventListener('keyup', searchBook);

function searchBook() {
    const searchValue = searchInput.value.toLowerCase();
    const bookItem = document.querySelectorAll('article');

    bookItem.forEach((item) => {
        const bookContent = item.children[0];
        const bookDescription = bookContent.children[1];
        const bookTitle = bookDescription.children[0].textContent.toLowerCase();
        const bookAuthor = bookDescription.children[1].textContent.toLowerCase();

        if (bookTitle.indexOf(searchValue) != -1 || bookAuthor.indexOf(searchValue) != -1) {
            item.setAttribute("style", "display: block;");
        } else {
            item.setAttribute("style", "display: none !important;");
        }
    })
}

//------ Swiper ----------------------------------
const unreadWrapper = [...document.querySelectorAll('#unread-bookshelf-wrapper')];
const unreadnextBtn = [...document.querySelectorAll('.unread__button-next')];
const unreadprevBtn = [...document.querySelectorAll('.unread__button-prev')];

unreadWrapper.forEach((item, i) => {
    unreadnextBtn[i].addEventListener('click', () => {
        item.scrollLeft += 306;
    })

    unreadprevBtn[i].addEventListener('click', () => {
        item.scrollLeft -= 306;
    })
})

const readWrapper = [...document.querySelectorAll('#read-bookshelf-wrapper')];
const readnextBtn = [...document.querySelectorAll('.read__button-next')];
const readprevBtn = [...document.querySelectorAll('.read__button-prev')];

readWrapper.forEach((item, i) => {
    readnextBtn[i].addEventListener('click', () => {
        item.scrollLeft += 306;
    })

    readprevBtn[i].addEventListener('click', () => {
        item.scrollLeft -= 306;
    })
})