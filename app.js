import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// Function to handle showing screens
function showScreen(screenId) {
    const screens = ['auth-screen', 'student-dashboard', 'teacher-dashboard', 'admin-panel'];
    screens.forEach(s => {
        const el = document.getElementById(s);
        if(el) el.style.display = (s === screenId) ? 'block' : 'none';
    });
}

// Ensure the DOM is fully loaded before attaching events
document.addEventListener('DOMContentLoaded', () => {

    // --- LOGIN ---
    document.getElementById('login-btn').addEventListener('click', () => {
        const email = document.getElementById('email').value;
        const pass = document.getElementById('password').value;
        signInWithEmailAndPassword(auth, email, pass)
            .then(() => alert("Logged in!"))
            .catch(err => alert(err.message));
    });

    // --- TEACHER SIGNUP/LOGIN ---
    document.getElementById('teacher-mode-btn').addEventListener('click', async () => {
        const email = prompt("Enter Teacher Email:");
        const pass = prompt("Create Teacher Password:");
        if (email && pass) {
            try {
                const res = await createUserWithEmailAndPassword(auth, email, pass);
                await setDoc(doc(db, "users", res.user.uid), {
                    role: 'teacher',
                    email: email
                });
                alert("Teacher account created!");
            } catch (e) { alert(e.message); }
        }
    });

    // --- STUDENT SIGNUP ---
    document.getElementById('signup-student-link').addEventListener('click', async (e) => {
        e.preventDefault();
        const email = prompt("Enter Student Email:");
        const pass = prompt("Create Password:");
        if (email && pass) {
            try {
                const res = await createUserWithEmailAndPassword(auth, email, pass);
                await setDoc(doc(db, "users", res.user.uid), {
                    role: 'student',
                    points: 0,
                    email: email
                });
                alert("Student account created!");
            } catch (e) { alert(e.message); }
        }
    });

    // --- SECRET ADMIN CODE ---
    document.getElementById('settings-btn').addEventListener('click', () => {
        const code = prompt("Admin Code:");
        if (code === "080112") showScreen('admin-panel');
    });
});

// --- AUTH STATE CHECK ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
            const data = snap.data();
            if (data.role === 'teacher') showScreen('teacher-dashboard');
            else showScreen('student-dashboard');
        }
    } else {
        showScreen('auth-screen');
    }
});
