
const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");
const search = document.getElementById("search");
const filter = document.getElementById("filter");
const sort = document.getElementById("sort");
const empty = document.getElementById("empty");

let files = [];
let gridView = false;

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => toast.classList.remove("show"), 2500);
}

function getType(file) {
    if (file.type.startsWith("image/")) return "image";

    if (file.type === "application/pdf") return "pdf";

    return "document";
}

// Upload files
document.getElementById("uploadBtn").onclick = () => {
    fileInput.click();
};

fileInput.onchange = (e) => {
    Array.from(e.target.files).forEach(file => {
        files.push({
            id: Date.now() + Math.random(),
            name: file.name,
            type: getType(file),
            size: file.size,
            date: new Date(),
            file: file
        });
    });

    renderFiles();
    showToast("Files uploaded successfully!");
    fileInput.value = "";
};

// New folder
document.getElementById("folderBtn").onclick = () => {
    const name = prompt("Enter folder name:");

    if (name && name.trim()) {
        files.push({
            id: Date.now(),
            name: name.trim(),
            type: "folder",
            size: 0,
            date: new Date(),
            file: null
        });

        renderFiles();
        showToast("Folder created successfully!");
    }
};

// Format size
function formatSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024)
        return (bytes / 1024).toFixed(1) + " KB";

    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

// Render files
function renderFiles() {
    let filtered = [...files];

    const keyword = search.value.toLowerCase();
    const type = filter.value;

    filtered = filtered.filter(file =>
        file.name.toLowerCase().includes(keyword)
    );

    if (type !== "all") {
        filtered = filtered.filter(file => file.type === type);
    }

    if (sort.value === "name") {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort.value === "oldest") {
        filtered.sort((a, b) => a.date - b.date);
    } else {
        filtered.sort((a, b) => b.date - a.date);
    }

    fileList.innerHTML = "";

    filtered.forEach(file => {
        const row = document.createElement("tr");

        const icon = {
            pdf: "📕",
            image: "🖼️",
            document: "📄",
            folder: "📁"
        }[file.type];

        const date = file.date.toLocaleDateString();

        row.innerHTML = `
            <td>
                <input type="checkbox" class="file-check"
                    value="${file.id}">
            </td>

            <td class="file-name">${icon} ${escapeHTML(file.name)}</td>

            <td class="file-type">${file.type.toUpperCase()}</td>

            <td>${formatSize(file.size)}</td>

            <td>${date}</td>

            <td>
                <button class="download-btn"
                    data-id="${file.id}">↓</button>

                <button class="delete-btn"
                    data-id="${file.id}">✕</button>
            </td>
        `;

        fileList.appendChild(row);
    });

    empty.style.display = filtered.length ? "none" : "block";
    document.getElementById("fileTable").style.display =
        filtered.length ? "table" : "none";

    document.getElementById("fileCount").textContent =
        `Showing ${filtered.length} of ${files.length} files`;

    updateStats();
}

// Escape HTML
function escapeHTML(value) {
    return value.replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Update dashboard statistics
function updateStats() {
    document.getElementById("totalFiles").textContent = files.length;

    document.getElementById("documents").textContent =
        files.filter(f => f.type === "pdf" || f.type === "document").length;

    document.getElementById("images").textContent =
        files.filter(f => f.type === "image").length;

    const totalSize = files.reduce((sum, f) => sum + f.size, 0);

    document.getElementById("storageUsed").textContent =
        (totalSize / (1024 * 1024)).toFixed(2) + " MB";
}

// Search and filters
search.addEventListener("input", renderFiles);
filter.addEventListener("change", renderFiles);
sort.addEventListener("change", renderFiles);

// Select all
document.getElementById("selectAll").onchange = (e) => {
    document.querySelectorAll(".file-check").forEach(check => {
        check.checked = e.target.checked;
    });
};

// Download and delete
fileList.addEventListener("click", (e) => {
    const id = Number(e.target.dataset.id);
    const file = files.find(f => f.id === id);

    if (!file) return;

    if (e.target.classList.contains("delete-btn")) {
        files = files.filter(f => f.id !== id);
        renderFiles();
        showToast("File deleted!");
    }

    if (e.target.classList.contains("download-btn")) {
        if (!file.file) {
            showToast("Folders cannot be downloaded!");
            return;
        }

        const url = URL.createObjectURL(file.file);
        const a = document.createElement("a");

        a.href = url;
        a.download = file.name;
        a.click();

        URL.revokeObjectURL(url);
        showToast("Download started!");
    }
});

// Delete selected
document.getElementById("deleteSelected").onclick = () => {
    const selected = Array.from(
        document.querySelectorAll(".file-check:checked")
    ).map(check => Number(check.value));

    if (!selected.length) {
        showToast("Please select files first!");
        return;
    }

    files = files.filter(file => !selected.includes(file.id));

    document.getElementById("selectAll").checked = false;

    renderFiles();
    showToast("Selected files deleted!");
};

// Grid/List toggle
document.getElementById("viewBtn").onclick = () => {
    gridView = !gridView;

    document.getElementById("viewBtn").textContent =
        gridView ? "☰ List View" : "▦ Grid View";

    showToast(gridView
        ? "Grid view selected (list layout retained)"
        : "List view selected");
};

renderFiles();
