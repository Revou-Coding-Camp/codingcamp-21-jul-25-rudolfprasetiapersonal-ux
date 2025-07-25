const darkMode = document.getElementById("darkMode");
const deleteBtn = document.getElementById("deleteBtn");
const filterBtn = document.getElementById("filterBtn");
const taskInput = document.getElementById("taskInput");
const dateInput = document.getElementById("dateInput");
const todoList = document.getElementById("todoList");
const undoBtn = document.getElementById("undoBtn");
const filterMenu = document.getElementById("filterMenu");
const applyFilterBtn = document.getElementById("applyFilterBtn");

document.addEventListener("DOMContentLoaded", () => {
  // Cek preferensi user, default tetap dark mode
  if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("white-mode"); // aktifkan light mode
  }

  darkMode.addEventListener("click", () => {
    document.body.classList.toggle("white-mode");

    if (document.body.classList.contains("white-mode")) {
      localStorage.setItem("theme", "light");
    } else {
      localStorage.setItem("theme", "dark");
    }
  });
});

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let lastDeleted = null;

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks(list) {
  todoList.innerHTML = "";
  list.forEach((task, index) => {
    const item = document.createElement("div");
    item.className = "todo-item";
    if (task.completed) item.classList.add("completed");

    item.innerHTML = `
      <div class="task-text">${task.text} <p>(${task.date})</p></div>
      <button class="delete-btn">
        <img src="asset/icons8-trash-50.png" alt="Delete icon" class="button__icon" />
      </button>
    `;

    item.addEventListener("click", () => {
      task.completed = !task.completed;
      saveTasks();
      renderTasks(tasks);
    });

    item.querySelector(".delete-btn").addEventListener("click", (event) => {
      event.stopPropagation();
      deleteTask(index, item);
    });

    todoList.appendChild(item);
  });
}

function deleteTask(index, item) {
  lastDeleted = { task: tasks[index], index };
  item.classList.add(
    "animate__animated",
    "animate__fadeOutLeft",
    "animate__faster"
  );

  item.addEventListener("animationend", () => {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks(tasks);
  });
}

deleteBtn.addEventListener("click", () => {
  if (tasks.length === 0) {
    Swal.fire({
      icon: "info",
      title: "No tasks",
      text: "There are no tasks to delete.",
    });
    return;
  }

  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#4caf50",
    confirmButtonText: "Yes, delete all!",
  }).then((result) => {
    if (result.isConfirmed) {
      tasks = [];
      saveTasks();
      renderTasks(tasks);
      Swal.fire({
        title: "Deleted!",
        text: "All your tasks have been deleted.",
        icon: "success",
      });
    }
  });
});

addBtn.addEventListener("click", () => {
  const text = taskInput.value.trim();
  const date = dateInput.value;
  if (!text || !date) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Please enter task and date!",
    });
    return;
  }

  const newTask = { text, date, completed: false };
  tasks.unshift(newTask);
  saveTasks();

  const item = document.createElement("div");
  item.className =
    "todo-item animate__animated animate__fadeInRight animate__faster";
  item.innerHTML = `
    <div class="task-text">${newTask.text} <p>(${newTask.date})</p></div>
    <button class="delete-btn">
      <img src="asset/icons8-trash-50.png" alt="Delete icon" class="button__icon" />
    </button>
  `;

  item.addEventListener("click", () => {
    newTask.completed = !newTask.completed;
    saveTasks();
    renderTasks(tasks);
  });
  item.querySelector(".delete-btn").addEventListener("click", (event) => {
    event.stopPropagation();
    deleteTask(0, item);
  });

  todoList.prepend(item);
  taskInput.value = "";
  dateInput.value = "";
});

undoBtn.addEventListener("click", () => {
  if (lastDeleted) {
    tasks.splice(lastDeleted.index, 0, lastDeleted.task);
    saveTasks();
    renderTasks(tasks);

    const restoredItem = todoList.children[lastDeleted.index];
    restoredItem.classList.add(
      "animate__animated",
      "animate__fadeInRight",
      "animate__faster"
    );

    lastDeleted = null;
  } else {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Nothing was deleted",
    });
  }
});

filterBtn.addEventListener("click", () => {
  Swal.fire({
    title: "Filter Options",
    html: `
      <div style="text-align:left">
        <label><input type="radio" name="sort" value="az" checked /> A → Z</label><br />
        <label><input type="radio" name="sort" value="za" /> Z → A</label><br />
        <label><input type="radio" name="sort" value="dateAsc" /> Oldest → Newest</label><br />
        <label><input type="radio" name="sort" value="dateDesc" /> Newest → Oldest</label><br />
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Apply",
    preConfirm: () => {
      const selected = document.querySelector(
        'input[name="sort"]:checked'
      ).value;
      return selected;
    },
  }).then((result) => {
    if (result.isConfirmed) {
      const selected = result.value;
      if (selected === "az") {
        tasks.sort((a, b) =>
          a.text.toLowerCase().localeCompare(b.text.toLowerCase())
        );
      } else if (selected === "za") {
        tasks.sort((a, b) =>
          b.text.toLowerCase().localeCompare(a.text.toLowerCase())
        );
      } else if (selected === "dateAsc") {
        tasks.sort((a, b) => {
          if (a.date === b.date)
            return a.text.toLowerCase().localeCompare(b.text.toLowerCase());
          return new Date(a.date) - new Date(b.date);
        });
      } else if (selected === "dateDesc") {
        tasks.sort((a, b) => {
          if (a.date === b.date)
            return a.text.toLowerCase().localeCompare(b.text.toLowerCase());
          return new Date(b.date) - new Date(a.date);
        });
      }

      saveTasks();
      renderTasks(tasks);
    }
  });
});

renderTasks(tasks);
