
// 1. KONEKSI SUPABASE

const SUPABASE_URL = "URL_SUPABASE";
const SUPABASE_KEY = "ANON_KEY";

const db = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// 2. MENGAMBIL ELEMENT HTML

const foodForm = document.getElementById("foodForm");
const foodTable = document.getElementById("foodTable");
const message = document.getElementById("message");

const idInput = document.getElementById("id_makanan");
const namaInput = document.getElementById("nama_makanan");
const hargaInput = document.getElementById("harga");

const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const formTitle = document.getElementById("formTitle");

// Format Rupiah
function formatRupiah(harga) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(harga);
}

// Menampilkan pesan
function showMessage(text, success = true) {
    message.textContent = text;
    message.style.color = success ? "green" : "red";
}

// 3. SELECT - MENAMPILKAN DATA

async function loadData() {

    const { data, error } = await db
        .from("makanan")
        .select("*")
        .order("id_makanan", { ascending: true });

    if (error) {
        showMessage("Gagal mengambil data: " + error.message, false);
        return;
    }

    foodTable.innerHTML = "";

    if (data.length === 0) {
        foodTable.innerHTML =
            `<tr><td colspan="4">Belum ada data makanan</td></tr>`;
        return;
    }

    data.forEach(item => {

        const row = document.createElement("tr");

        const idCell = document.createElement("td");
        idCell.textContent = item.id_makanan;

        const namaCell = document.createElement("td");
        namaCell.textContent = item.nama_makanan;

        const hargaCell = document.createElement("td");
        hargaCell.textContent = formatRupiah(item.harga);

        const aksiCell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit";
        editButton.addEventListener("click", () => editData(item));

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete";
        deleteButton.addEventListener("click", () => deleteData(item.id_makanan));

        aksiCell.append(editButton, deleteButton);

        row.append(idCell, namaCell, hargaCell, aksiCell);
        foodTable.appendChild(row);
    });
}

// 4. INSERT DAN UPDATE

foodForm.addEventListener("submit", async function(e) {

    e.preventDefault();

    const nama = namaInput.value.trim();
    const harga = Number(hargaInput.value);

    if (!nama || !Number.isFinite(harga) || harga <= 0) {
        showMessage("Masukkan nama dan harga yang valid!", false);
        return;
    }

    saveBtn.disabled = true;

    let result;

    if (idInput.value) {

        // UPDATE / EDIT
        result = await db
            .from("makanan")
            .update({
                nama_makanan: nama,
                harga: harga
            })
            .eq("id_makanan", idInput.value);

    } else {

        // INSERT / TAMBAH
        result = await db
            .from("makanan")
            .insert([{
                nama_makanan: nama,
                harga: harga
            }]);
    }

    saveBtn.disabled = false;

    if (result.error) {
        showMessage("Gagal menyimpan: " + result.error.message, false);
        return;
    }

    showMessage(
        idInput.value
        ? "Data berhasil diperbarui!"
        : "Data berhasil ditambahkan!"
    );

    resetForm();
    loadData();
});

// 5. EDIT DATA

function editData(item) {

    idInput.value = item.id_makanan;
    namaInput.value = item.nama_makanan;
    hargaInput.value = item.harga;

    formTitle.textContent = "Edit Data Makanan";
    saveBtn.textContent = "Simpan Perubahan";
    cancelBtn.hidden = false;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// 6. DELETE DATA

async function deleteData(id) {

    const yakin = confirm("Apakah kamu yakin ingin menghapus data ini?");

    if (!yakin) return;

    const { error } = await db
        .from("makanan")
        .delete()
        .eq("id_makanan", id);

    if (error) {
        showMessage("Gagal menghapus: " + error.message, false);
        return;
    }

    showMessage("Data berhasil dihapus!");
    loadData();
}

// 7. RESET FORM

function resetForm() {

    foodForm.reset();
    idInput.value = "";

    formTitle.textContent = "Tambah Data Makanan";
    saveBtn.textContent = "+ Tambah Makanan";
    cancelBtn.hidden = true;
}

cancelBtn.addEventListener("click", resetForm);

// 8. MENJALANKAN PROGRAM

loadData();
