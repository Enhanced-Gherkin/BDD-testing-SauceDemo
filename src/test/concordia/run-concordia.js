const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const RUNS = 25;
const PROJECT_ROOT = process.cwd();
const METRICS_DIR = path.join(PROJECT_ROOT, 'results');
if (!fs.existsSync(METRICS_DIR)) fs.mkdirSync(METRICS_DIR, { recursive: true });

const configPath = path.join(PROJECT_ROOT, 'codecept.conf.js');
if (!fs.existsSync(configPath)) {
    console.error(' Файл codecept.conf.js не найден в корне проекта.');
    process.exit(1);
}

const oldJson = path.join(PROJECT_ROOT, 'codecept.json');
if (fs.existsSync(oldJson)) {
    fs.unlinkSync(oldJson);
    console.log('Удалён старый codecept.json (если был)');
}

console.log('Генерация тестовых скриптов...');
try {
    execSync('npx concordia --just-script', { cwd: PROJECT_ROOT, stdio: 'inherit' });
} catch (err) {
    console.error('Ошибка генерации:', err);
    process.exit(1);
}

console.log(`\nЗапуск ${RUNS} прогонов тестов ConcordiaLang...`);
for (let i = 1; i <= RUNS; i++) {
    console.log(`\nПрогон ${i} из ${RUNS}...`);
    const env = { ...process.env, RUN_INDEX: String(i) };
    try {
        execSync('npx codeceptjs run -c codecept.conf.js', {
            cwd: PROJECT_ROOT,
            stdio: 'inherit',
            env,
        });
        console.log(` Прогон ${i} завершён успешно.`);
    } catch (err) {
        console.error(` Прогон ${i} завершился с ошибкой (код ${err.status}).`);
    }
}

console.log(`\n Все ${RUNS} прогонов выполнены.`);
console.log(`Метрики сохранены в ${METRICS_DIR}`);
