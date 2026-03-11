const Logic = {
    AND: (a, b) => a && b,
    OR: (a, b) => a || b,
    NOT: (a) => !a
};

let users = [
    { id: 0, name: "admin", isAuth: true, isStudent: true, isMethodist: true, isAdmin: true }
];

let currentUser = null;

const auth = {
    login(id) {
        currentUser = users.find(u => u.id === id);
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('main-section').classList.remove('hidden');
        document.getElementById('current-user-name').innerText = currentUser.name;
        document.getElementById('nav-admin').classList.toggle('hidden', !currentUser.isAdmin);
        document.getElementById('nav-deanery').classList.toggle('hidden', !Logic.OR(currentUser.isMethodist,currentUser.isAdmin));
        router.navigate('cabinet');
    },
    logout() {
        currentUser = null;
        document.getElementById('auth-section').classList.remove('hidden');
        document.getElementById('main-section').classList.add('hidden');
        ui.renderLoginButtons();
    }
};

const router = {
    navigate(page) {
        const view = document.getElementById('view');
        const errorPlate = document.getElementById('error-plate');
        errorPlate.classList.add('hidden');
        view.innerHTML = '';

        const A = currentUser.isAuth;
        const B = currentUser.isStudent;
        const C = currentUser.isMethodist;
        const D = currentUser.isAdmin;

        let hasAccess = false;
        switch(page) {
            case 'cabinet': hasAccess = Logic.AND(A, Logic.OR(B, Logic.OR(C, D))); break;
            case 'deanery': hasAccess = Logic.AND(A, Logic.OR(C, D)); break;
            case 'admin':   hasAccess = Logic.AND(A, D); break;
        }

        if (!hasAccess) {
            errorPlate.classList.remove('hidden');
            return;
        }
        this.render(page, view);
    },

    render(page, container) {
        if (page === 'cabinet') ui.renderCabinet(container);
        if (page === 'deanery') ui.renderManagement(container, 'deanery');
        if (page === 'admin') ui.renderManagement(container, 'admin');
    }
};

const ui = {
    renderLoginButtons() {
        const container = document.getElementById('user-buttons');
        container.innerHTML = '';
        users.forEach(u => {
            const btn = document.createElement('button');
            btn.innerText = u.name;
            btn.onclick = () => auth.login(u.id);
            container.appendChild(btn);
        });
    },

    renderCabinet(container) {
        container.innerHTML = `<h2>Личный кабинет</h2>
            <p>Ваши права доступа:</p>
            <table>
                <thead><tr><th>S</th><th>M</th><th>A</th></tr></thead>
                <tbody>
                    <tr>
                        <td><input type="checkbox" disabled ${currentUser.isStudent ? 'checked' : ''}></td>
                        <td><input type="checkbox" disabled ${currentUser.isMethodist ? 'checked' : ''}></td>
                        <td><input type="checkbox" disabled ${currentUser.isAdmin ? 'checked' : ''}></td>
                    </tr>
                </tbody>
            </table>`;
    },

    renderManagement(container, mode) {
        const isAdminMode = mode === 'admin';
        const isFullAdmin = currentUser.isAdmin;
        
        let html = `<h2>${isAdminMode ? 'Панель администрирования' : 'Электронный деканат'}</h2>`;
        
        if (isAdminMode) {
            html += `<div class="admin-controls">
                <input type="text" id="new-name" placeholder="ФИО нового пользователя">
                <label><input type="checkbox" id="c-s"> S</label>
                <label><input type="checkbox" id="c-m"> M</label>
                <label><input type="checkbox" id="c-a"> A</label>
                <button onclick="ui.createUser()">Создать</button>
            </div>`;
        }

        html += `<table>
            <thead>
                <tr>
                    <th style="text-align:left">Имя</th>
                    <th>S</th><th>M</th><th>A</th>
                    ${isAdminMode ? '<th>Действия</th>' : ''}
                </tr>
            </thead>
            <tbody>`;

        users.forEach(u => {
            const canEdit = isFullAdmin || (currentUser.isMethodist && !u.isAdmin);
            const isSelf = u.id === currentUser.id;

            html += `<tr>
                <td>${u.name}</td>
                <td><input type="checkbox" ${u.isStudent?'checked':''} onchange="ui.toggle(${u.id}, 'isStudent')" ${!canEdit?'disabled':''}></td>
                <td><input type="checkbox" ${u.isMethodist?'checked':''} onchange="ui.toggle(${u.id}, 'isMethodist')" ${!canEdit?'disabled':''}></td>
                <td><input type="checkbox" ${u.isAdmin?'checked':''} onchange="ui.toggle(${u.id}, 'isAdmin')" ${(!isFullAdmin || isSelf)?'disabled':''}></td>
                ${isAdminMode ? `<td>${!isSelf && u.id !== 0 ? `<button onclick="ui.deleteUser(${u.id})">Удалить</button>` : '—'}</td>` : ''}
            </tr>`;
        });
        container.innerHTML = html + `</tbody></table>`;
    },

    toggle(id, field) {
        const u = users.find(x => x.id === id);
        if (u) u[field] = Logic.NOT(u[field]);
    },

    createUser() {
        const name = document.getElementById('new-name').value;
        if (!name) return;
        users.push({
            id: Date.now(),
            name: name,
            isAuth: true,
            isStudent: document.getElementById('c-s').checked,
            isMethodist: document.getElementById('c-m').checked,
            isAdmin: document.getElementById('c-a').checked
        });
        router.navigate('admin');
    },

    deleteUser(id) {
        users = users.filter(u => u.id !== id);
        router.navigate('admin');
    }
};

ui.renderLoginButtons();
