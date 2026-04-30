import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
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

// DEBUG LOG
console.log("REGP App Logic Loaded");

function showScreen(id) {
    document.getElementById('auth-screen').style.display = (id === 'auth-screen') ? 'block' : 'none';
    document.getElementById('student-dashboard').style.display = (id === 'student-dashboard') ? 'flex' : 'none';
    document.getElementById('admin-panel').style.display = (id === 'admin-panel') ? 'block' : 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    
    // --- LOGIN BUTTON FIX ---
    const loginBtn = document.getElementById('login-btn');
    if(loginBtn) {
        loginBtn.onclick = () => {
            const email = document.getElementById('email').value;
            const pass = document.getElementById('password').value;
            signInWithEmailAndPassword(auth, email, pass).catch(e => alert(e.message));
        };
    }

    // --- SIDEBAR TAB NAVIGATION ---
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.onclick = () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            const target = item.getAttribute('data-target');
            if(target) {
                document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
                document.getElementById(target).style.display = 'block';
            }
        };
    });

    // --- SECRET ADMIN BUTTON IN SIDEBAR ---
    const setBtn = document.getElementById('settings-btn-sidebar');
    setBtn.onclick = () => {
        const code = prompt("Enter Admin Code:");
        if (code === "080112") showScreen('admin-panel');
    };

    // --- TEACHER SIGNUP ---
    document.getElementById('teacher-mode-btn').onclick = async () => {
        const email = prompt("Teacher Email:");
        const pass = prompt("Password:");
        if(email && pass) {
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            await setDoc(doc(db, "users", res.user.uid), { role: 'teacher', email: email });
            alert("Teacher created!");
        }
    };
    
    // --- STUDENT SIGNUP ---
    document.getElementById('signup-student-link').onclick = async () => {
        const email = prompt("Student Email:");
        const pass = prompt("Password:");
        if(email && pass) {
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            await setDoc(doc(db, "users", res.user.uid), { role: 'student', points: 0, email: email });
            alert("Student created!");
        }
    };

    // --- SAVE BOOK ---
    document.getElementById('save-book-btn').onclick = async () => {
        const title = document.getElementById('new-book-title').value;
        const text = document.getElementById('section-text').value;
        const qs = Array.from(document.querySelectorAll('.q-in')).map(i => i.value);
        await addDoc(collection(db, "books"), { title, text, questions: qs });
        alert("Book Added to Library!");
    };
});

// --- AUTH STATE ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
            showScreen('student-dashboard');
            document.getElementById('stat-name').innerText = snap.data().email;
            document.getElementById('stat-points').innerText = (snap.data().points || 0) + " SRP";
        }
    } else {
        showScreen('auth-screen');
    }
});
