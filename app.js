import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, updateDoc, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// --- NAVIGATION LOGIC ---
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'block';
}

// --- HIDDEN ADMIN BUTTON ---
document.getElementById('admin-trigger').addEventListener('click', () => {
    const code = prompt("Enter Admin Code:");
    if (code === "080112") {
        showScreen('admin-panel');
        document.getElementById('settings-modal').style.display = 'none';
    }
});

// --- AUTHENTICATION ---
document.getElementById('signup-btn').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    try {
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        await setDoc(doc(db, "users", res.user.uid), {
            email: email,
            role: 'student',
            points: 0
        });
        alert("Account Created!");
    } catch (e) { alert(e.message); }
});

document.getElementById('login-btn').addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    signInWithEmailAndPassword(auth, email, pass).catch(e => alert(e.message));
});

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        const userData = userSnap.data();
        if (userData.role === 'teacher') {
            showScreen('teacher-dashboard');
            loadClass(user.uid);
        } else {
            showScreen('student-dashboard');
            document.getElementById('user-display-name').innerText = userData.email;
            document.getElementById('user-points').innerText = userData.points;
            loadBooks();
        }
    } else {
        showScreen('auth-screen');
    }
});

// --- ADMIN: CREATE BOOK ---
document.getElementById('save-book-btn').addEventListener('click', async () => {
    const title = document.getElementById('new-book-title').value;
    const points = parseInt(document.getElementById('new-book-points').value);
    const text = document.getElementById('section-text').value;
    const qs = Array.from(document.querySelectorAll('.q-input')).map(i => i.value);

    await addDoc(collection(db, "books"), {
        title,
        points,
        sectionText: text,
        questions: qs // Simplified: 1 question per input
    });
    alert("Book Saved!");
});

// --- STUDENT: READ & QUIZ ---
async function loadBooks() {
    const querySnapshot = await getDocs(collection(db, "books"));
    const container = document.getElementById('book-list');
    container.innerHTML = '';
    querySnapshot.forEach((doc) => {
        const book = doc.data();
        const btn = document.createElement('button');
        btn.innerText = `Read: ${book.title}`;
        btn.onclick = () => startReading(book);
        container.appendChild(btn);
    });
}

function startReading(book) {
    showScreen('reading-screen');
    document.getElementById('reading-title').innerText = book.title;
    document.getElementById('section-content').innerText = book.sectionText;
    
    document.getElementById('read-section-btn').onclick = () => {
        showScreen('quiz-screen');
        loadQuiz(book);
    };
}

function loadQuiz(book) {
    const container = document.getElementById('quiz-container');
    container.innerHTML = book.questions.map((q, i) => `
        <div>
            <p>${q}</p>
            <input type="radio" name="q${i}" value="correct"> Correct
            <input type="radio" name="q${i}" value="wrong"> Incorrect
        </div>
    `).join('');

    document.getElementById('submit-quiz').onclick = async () => {
        const correctCount = document.querySelectorAll('input[value="correct"]:checked').length;
        if (correctCount >= 2) {
            alert(`Passed! You got ${correctCount}/4. Points awarded: ${book.points}`);
            const userRef = doc(db, "users", auth.currentUser.uid);
            const userSnap = await getDoc(userRef);
            await updateDoc(userRef, {
                points: (userSnap.data().points || 0) + book.points
            });
            location.reload();
        } else {
            alert("Did not pass. Try reading again!");
            showScreen('student-dashboard');
        }
    };
}

// Global functions for buttons
window.showSettings = () => document.getElementById('settings-modal').style.display = 'block';
window.closeSettings = () => document.getElementById('settings-modal').style.display = 'none';
window.logout = () => signOut(auth);
