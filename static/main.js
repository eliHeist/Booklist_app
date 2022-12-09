// Book Class: Represents a Book
class Book {
   constructor(title, authour, isbn) {
      this.title = title;
      this.authour = authour;
      this.isbn = isbn;
   }
}

// UI Class: Handle UI Tasks
class UI {
   static displayBooks() {
      const books = Store.getBooks();

      books.forEach((book) => UI.addBookToList(book));
   }

   static addBookToList(book) {
      const list = document.querySelector('#book-list');

      const row = document.createElement('tr');

      row.classList.add('fs-5');

      row.innerHTML = `
         <td id="i-title">${book.title}</td>
         <td id="i-authour">${book.authour}</td>
         <td id="i-isbn">${book.isbn}</td>
         <td><a href="#" class="btn text-danger btn-sm p-0"><i class="fas fa-window-close h-100 delete"></i></a></td>
         <td><a href="#" class="btn text-primary btn-sm edit p-0"><i class="fas fa-edit edit"></i></a></td>
         `;

      list.appendChild(row);
   }

   static deleteBook(el) {
      if (el.classList.contains('delete')) {
         el.parentElement.parentElement.parentElement.remove();
      }
   }

   static showAlert(message, className) {
      const div = document.createElement('div');
      div.className = `alert alert-${className}`;
      div.appendChild(document.createTextNode(message));
      const container = document.querySelector('.container');
      const form = document.querySelector('#book-form');
      container.insertBefore(div, form);
      // vanish in 3 seconds
      setTimeout(() => document.querySelector('.alert').remove(), 3000);
   }

   static clearFields() {
      document.querySelector('#title').value = '';
      document.querySelector('#author').value = '';
      document.querySelector('#isbn').value = '';

      closeAddForm();
   }

   static fillUpdateForm(title, authour, isbn) {
      document.querySelector('#Utitle').value = title;
      document.querySelector('#Uauthor').value = authour;
      document.querySelector('#Uisbn').value = isbn;
   }
   static clearUpdateForm() {
      document.querySelector('#Utitle').value = '';
      document.querySelector('#Uauthor').value = '';
      document.querySelector('#Uisbn').value = '';

      closeUpdateForm();
   }
   static updateBook(data) {
      const isbns = document.querySelectorAll('#i-isbn');
      isbns.forEach(isbn => {
         console.log(isbn.innerText == data.isbn);
         if (isbn.innerHTML == data.isbn) {
            isbn.previousElementSibling.textContent = data.authour;
            isbn.previousElementSibling.previousElementSibling.textContent = data.title;
         }
      });
   }
}

//#region data from django api
// fetch books from api
const api_url = 'http://127.0.0.1:8000/api/books/';
async function apiFetchBooks() {
   const response = await fetch(api_url);
   const data = await response.json();
   localStorage.setItem('books', JSON.stringify(data));
}

// add a book to database
let csrf = () => {
   token = document.getElementById('token').firstElementChild.value;
   return token;
};
// console.log(csrf());

let apiAddBook = async (book) => {
   const response = await fetch(api_url, {
      method: 'POST',
      headers: {
         Accept: 'application/json',
         'Content-Type': 'application/json',
         'X-CSRFToken': csrf(),
      },
      body: JSON.stringify(book),
   });
   const data = await response.json();
   console.log(data);
   // add book to UI
   UI.addBookToList(data);

   // add to store
   Store.addBook(JSON.stringify(data));
};

let apiUpdateBook = async (book) => {
   const response = await fetch(`${api_url}${book.isbn}/`, {
      method: 'PUT',
      headers: {
         Accept: 'application/json',
         'Content-Type': 'application/json',
         'X-CSRFToken': csrf(),
      },
      body: JSON.stringify(book),
   });
   const data = await response.json();
   // update store
   Store.updateBook(data);
   // update UI
   UI.updateBook(data);
   
};

let apiDeleteBook = async (target) => {
   const isbn = target.parentElement.parentElement.previousElementSibling.textContent
   const response = await fetch(`${api_url}${isbn}/`, {
      method: 'DELETE',
      headers: {
         'Content-Type': 'application/json',
         'X-CSRFToken': csrf(),
      }
   })
   const data = await response.json();
   // console.log(data);
   if (data === 'Deleted') {
      UI.deleteBook(target);
      Store.removeBook(isbn);
      // show success message
      UI.showAlert('Book Removed', 'success');
   } else {
      UI.showAlert('Failed to delete book', 'danger');
   }
}
apiFetchBooks();
//#endregion

//#region store
// Store class: Handles Storage
class Store {
   static getBooks() {
      let books;
      if (localStorage.getItem('books') === null) {
         books = [];
      } else {
         books = JSON.parse(localStorage.getItem('books'));
      }

      return books;
   }

   static addBook(book) {
      const books = Store.getBooks();
      books.push(book);
      localStorage.setItem('books', JSON.stringify(books));
   }

   static removeBook(isbn) {
      const books = Store.getBooks();

      books.forEach((book, index) => {
         if (book.isbn === isbn) {
            books.splice(index, 1);
         }
      });

      localStorage.setItem('books', JSON.stringify(books));
   }

   static verifyBook(isbn) {
      const books = Store.getBooks();
      let value = false;

      books.forEach((book) => {
         if (book.isbn + ' ' === isbn + ' ') {
            console.log('found match for isbn');
            value = true;
         }
      });
      return value;
   }

   static updateBook(Ubook) {
      const books = Store.getBooks();

      books.forEach((book) => {
         if (book.isbn === Ubook.isbn) {
            book.authour = Ubook.authour;
            book.title = Ubook.title;
         }
      });
      
      localStorage.setItem('books', JSON.stringify(books));
   }
}
//#endregion

// Event: Display Books
document.addEventListener('DOMContentLoaded', UI.displayBooks);

// Event: Add a Book
document.querySelector('#book-form').addEventListener('submit', (e) => {
   // prevent submit
   e.preventDefault();

   // get form values
   const title = document.querySelector('#title').value;
   const author = document.querySelector('#author').value;
   const isbn = document.querySelector('#isbn').value;

   // validation
   if (title === '' || author === '' || isbn === '') {
      UI.showAlert('Please fill in all fields', 'danger');
   }else if (Store.verifyBook(isbn)) {
      UI.showAlert('ISBN already exists!', 'danger');
   } else {
      // instantiate book
      const book = new Book(title, author, isbn);

      //  add to api
      apiAddBook(book);

      // show success message
      UI.showAlert('Book Added', 'success');

      // clear fields
      UI.clearFields();
   }
});

// Event: Remove a Book, or start update
document.querySelector('#book-list').addEventListener('click', (e) => {

   if (e.target.classList.contains('delete')) {
      // remove from local storage
      apiDeleteBook(e.target);
   } else if (e.target.classList.contains('edit')) {
      // get title
      const title = e.target.parentElement.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.textContent;
      // get authour
      const authour = e.target.parentElement.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.textContent;
      // get isbn
      const isbn = e.target.parentElement.parentElement.previousElementSibling.previousElementSibling.textContent;

      document.querySelector('#update_form').firstElementChild.classList.remove('d-none');

      UI.fillUpdateForm(title, authour, isbn);
   }
   
});

// Event: update a book
document.querySelector('#update_form').addEventListener('submit', (e) => {
   // prevent submit
   e.preventDefault();

   // get form values
   const title = document.querySelector('#Utitle').value;
   const author = document.querySelector('#Uauthor').value;
   const isbn = document.querySelector('#Uisbn').value;

   // validate
   if (title === '' || author === '' || isbn === '') {
      UI.showAlert('Please fill in all fields', 'danger');
   } else {
      // instantiate book
      const book = new Book(title, author, isbn);

      //  add to api
      apiUpdateBook(book);

      // show success message
      UI.showAlert('Book Updated', 'success');

      // clear fields
      UI.clearUpdateForm();
   }
});

// closing update form
function closeUpdateForm() {
   document.querySelector('#update_form').firstElementChild.classList.add('d-none');
}
document.querySelector('#close-form').addEventListener('click', () => {
   closeUpdateForm();
});

// opening and closing add form
function closeAddForm() {
   document.querySelector('#book-form').firstElementChild.classList.add('d-none');
}
document.querySelector('#close-add-form').addEventListener('click', () => {
   closeAddForm();
});
function openAddForm() {
   document.querySelector('#book-form').firstElementChild.classList.remove('d-none');
}
document.querySelector('#open-add-form').addEventListener('click', () => {
   openAddForm();
});

