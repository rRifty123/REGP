import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAp6jhQBM6DRlQIYe6iUyq4bUDEPFvpP_8",
    authDomain: "regp-7df25.firebaseapp.com",
    projectId: "regp-7df25",
    storageBucket: "regp-7df25.firebasestorage.app",
    messagingSenderId: "618220019336",
    appId: "1:618220019336:web:becc13c1d46388845d893d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function showScreen(id) {
    document.getElementById('auth-screen').style.display = (id === 'auth-screen') ? 'block' : 'none';
    document.getElementById('student-dashboard').style.display = (id === 'student-dashboard') ? 'flex' : 'none';
    document.getElementById('admin-panel').style.display = (id === 'admin-panel') ? 'block' : 'none';
}

// Function to fetch books from Firestore and show them in the Library tab
async function loadBooks() {
    const bookGrid = document.getElementById('book-grid');
    if(!bookGrid) return;
    
    bookGrid.innerHTML = "Loading books...";
    try {
        const querySnapshot = await getDocs(collection(db, "books"));
        bookGrid.innerHTML = ""; // Clear loader
        
        if (querySnapshot.empty) {
            bookGrid.innerHTML = "<p>No books published yet.</p>";
            return;
        }

        querySnapshot.forEach((doc) => {
            const book = doc.data();
            const bookCard = document.createElement('div');
            bookCard.className = "latest-book-card"; 
            bookCard.style.marginBottom = "15px";
            bookCard.innerHTML = `
                <div class="book-row">
                    <div class="book-placeholder">📖</div>
                    <div class="book-info">
                        <p class="b-title"><strong>${book.title}</strong></p>
                        <button class="start-btn" onclick="alert('Starting ${book.title}...')">Read Now</button>
                    </div>
                </div>
            `;
            bookGrid.appendChild(bookCard);
        });
    } catch (e) {
        console.error("Error loading books: ", e);
        bookGrid.innerHTML = "Error loading library.";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    
    // LOGOUT LOGIC
    const logoutBtn = document.getElementById('logout-btn-header');
    if(logoutBtn) {
        logoutBtn.onclick = () => {
            signOut(auth).then(() => {
                showScreen('auth-screen');
            }).catch(e => alert("Logout failed"));
        };
    }

    // LOGIN
    document.getElementById('login-btn').onclick = () => {
        const email = document.getElementById('email').value;
        const pass = document.getElementById('password').value;
        if(!email || !pass) return alert("Please fill in all fields");
        signInWithEmailAndPassword(auth, email, pass).catch(e => alert("Login Error: " + e.message));
    };

    // STUDENT SIGNUP
    document.getElementById('signup-student-link').onclick = (e) => {
        e.preventDefault();
        const email = prompt("Enter Student Email:");
        const pass = prompt("Create Password (min 6 characters):");
        if(email && pass) {
            createUserWithEmailAndPassword(auth, email, pass)
                .then(async (res) => {
                    await setDoc(doc(db, "users", res.user.uid), { role: 'student', points: 0, email: email });
                    alert("Account created! Logging you in...");
                })
                .catch(err => alert(err.message));
        }
    };

    // TAB NAVIGATION
    document.querySelectorAll('.nav-item').forEach(item => {
        item.onclick = () => {
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const target = item.getAttribute('data-target');
            
            if(target) {
                document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
                document.getElementById(target).style.display = 'block';
                // If they click library, reload the books
                if(target === 'library-content') loadBooks();
            }
        };
    });

    // ADMIN TRIGGER
    document.getElementById('settings-btn-sidebar').onclick = () => {
        if (prompt("Enter Admin Code:") === "080112") showScreen('admin-panel');
    };

    document.getElementById('admin-exit-btn').onclick = () => showScreen('student-dashboard');

    // SAVE BOOK
    document.getElementById('save-book-btn').onclick = async () => {
        const title = document.getElementById('new-book-title').value;
        const text = document.getElementById('section-text').value;
        const qs = Array.from(document.querySelectorAll('.q-in')).map(i => i.value);
        
        if(!title || !text) return alert("Fill in title and content");
        
        try {
            await addDoc(collection(db, "books"), { title, text, questions: qs, createdAt: new Date() });
            alert("Book added to Library!");
            document.getElementById('new-book-title').value = "";
            document.getElementById('section-text').value = "";
            showScreen('student-dashboard');
            loadBooks(); // Refresh library
        } catch(e) { alert("Error saving: " + e.message); }
    };
});

// AUTH LISTENER
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
            showScreen('student-dashboard');
            document.getElementById('stat-name').innerText = user.email;
            document.getElementById('stat-points').innerText = (snap.data().points || 0) + " REGPoints";
            loadBooks();
        }
    } else {
        showScreen('auth-screen');
    }
});
