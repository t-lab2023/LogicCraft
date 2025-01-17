const canvas = document.getElementById('gridCanvas');
    const ctx = canvas.getContext('2d');
    const newWireButton = document.getElementById('newWireButton');
    
    let allLines = [];
    let currentLine = [];
    let newLine = false;
    let clickTimeout = null;
    const componentFrames = [];
    const gridPoints = []; // 黒い円の座標を保持する配列
    const inputs = { A: 0, B: 0, C: 0 }; // 入力の値を保持するオブジェクト
    let Line = [];

    const inputPositions = {
        A: { x: 60, y: 150 },
        B: { x: 60, y: 350 },
        C: { x: 60, y: 550 }
    };

    // 入力値が変更されたときに呼び出されるイベントリスナー
    document.querySelectorAll('input[name="inputA"]').forEach(input => input.addEventListener('change', (event) => {
        inputs.A = parseInt(event.target.value);
        drawPolyline();
    }));

    document.querySelectorAll('input[name="inputB"]').forEach(input => input.addEventListener('change', (event) => {
        inputs.B = parseInt(event.target.value);
        drawPolyline();
    }));

    document.querySelectorAll('input[name="inputC"]').forEach(input => input.addEventListener('change', (event) => {
        inputs.C = parseInt(event.target.value);
        drawPolyline();
    }));


    /*回路画像チェンジ*/
    function imgChange(id, fname){
        const frame = componentFrames.find(frame => frame.id === id);
        if (!frame) return;

        const input1Element = document.getElementById('input1');
        const input2Element = document.getElementById('input2');

        if (input1Element && input2Element) {
            frame.input1 = parseInt(input1Element.value);
            frame.input2 = parseInt(input2Element.value);
        }
        
        let imageSrc;
        switch (fname) {
            case '':
                imageSrc = "img/WHITE.png";
                break;
            case 'and':
                imageSrc = "img/AND.jpg";
                break;
            case 'or':
                imageSrc = "img/OR.jpg";
                break;
            case 'xor':
                imageSrc = "img/XOR.jpg";
                break;
            case 'nand':
                imageSrc = "img/NAND.jpg";
                break;
            case 'nor':
                imageSrc = "img/NOR.jpg";
                break;
            case 'xnor':
                imageSrc = "img/XNOR.jpg";
                break;
            case 'not':
                imageSrc = "img/NOT.jpg";
                break;
        }

        frame.imageSrc = imageSrc; // フレームに画像ソースを保存
        frame.type = fname;
        calculateOutput(frame);
        alert(`Frame ${frame.id} changed: Input1 = ${frame.input1}, Input2 = ${frame.input2}, Output = ${frame.outputValue}`);
        drawPolyline();
    }

    //論理式を計算
    function calculateOutput(frame) {
        const input1 = frame.input1.includes(' ') ? `(${frame.input1})` : frame.input1;
        const input2 = frame.input2.includes(' ') ? `(${frame.input2})` : frame.input2;
        let newOutputValue;
    
        switch (frame.type) {
            case 'and':
                newOutputValue = `${input1} AND ${input2}`;
                break;
            case 'or':
                newOutputValue = `${input1} OR ${input2}`;
                break;
            case 'xor':
                newOutputValue = `${input1} XOR ${input2}`;
                break;
            case 'nand':
                newOutputValue = `NOT (${input1} AND ${input2})`;
                break;
            case 'nor':
                newOutputValue = `NOT (${input1} OR ${input2})`;
                break;
            case 'xnor':
                newOutputValue = `NOT (${input1} XOR ${input2})`;
                break;
            case 'not':
                newOutputValue = `NOT ${input1}`;
                break;
            default:
                newOutputValue = '';
                break;
        }
    
        frame.outputValue = newOutputValue;
    }

    function drawInputs() {
        ctx.font = '20px Arial';

        // 入力Aを描画
        const posA = inputPositions.A;
        ctx.fillStyle = inputs.A === 1 ? 'green' : 'black';
        ctx.fillText('A', posA.x, posA.y - 20);
        ctx.beginPath();
        ctx.arc(posA.x + 20, posA.y - 10, 10, 0, 2 * Math.PI); // 半径10の円を描く
        ctx.fill();

        // 入力Bを描画
        const posB = inputPositions.B;
        ctx.fillStyle = inputs.B === 1 ? 'green' : 'black';
        ctx.fillText('B', posB.x, posB.y - 20);
        ctx.beginPath();
        ctx.arc(posB.x + 20, posB.y - 10, 10, 0, 2 * Math.PI); // 半径10の円を描く
        ctx.fillStyle = inputs.B === 1 ? 'green' : 'black';
        ctx.fill();

        // 入力Cを描画
        const posC = inputPositions.C;
        ctx.fillStyle = inputs.C === 1 ? 'green' : 'black';
        ctx.fillText('C', posC.x, posC.y - 20);
        ctx.beginPath();
        ctx.arc(posC.x + 20, posC.y - 10, 10, 0, 2 * Math.PI); // 半径10の円を描く
        ctx.fillStyle = inputs.C === 1 ? 'green' : 'black';
        ctx.fill();
    }
    
    // 格子
    function drawGrid() {
        ctx.strokeStyle = '#ccc';
        for (let i = 0; i <= 60; i++) { // 横
            ctx.beginPath();
            ctx.moveTo(i * 20, 0);
            ctx.lineTo(i * 20, 720);
            ctx.stroke();
        }
        for (let i = 0; i <= 36; i++) { // 縦
            ctx.beginPath();
            ctx.moveTo(0, i * 20);
            ctx.lineTo(1200, i * 20);
            ctx.stroke();
        }
        // "Tanaka-Lab" を描画
        ctx.fillStyle = 'blue'; 
        ctx.font = '20px Arial'; 
        ctx.fillText('Tanaka-Lab', 1050, 30); 
        //drawGridPoints();
    }

    //初期の画像を表示
    function initializeComponentFrames() {
        const image = new Image();
        image.src = 'img/WHITE.png';

        image.onload = function() {
            const ids = ['program1', 'program2', 'program3', 'program4']; // 割り当てるIDの配列
            let idIndex = 0; // IDインデックスを初期化

            // 素子を配置する枠に画像を表示
            for (let i = 16; i < 46; i += 20) {
                for (let j = 8; j < 32; j += 12) {
                    if (idIndex >= ids.length) break; // すべてのIDが割り当てられたらループを終了

                    const frameX = i * 20;
                    const frameY = j * 20;
                    const frameWidth = 7.9 * 20;  // 横幅を少し狭くする
                    const frameHeight = 6 * 20;

                    const offsetX = (8 * 20 - frameWidth) / 2;  // 中央に配置するためのオフセット
                    const imageX = frameX + offsetX;

                    // IDを割り当て
                    const componentId = ids[idIndex++];

                    // IDを含む情報をcomponentFramesに追加
                    componentFrames.push({
                        id: componentId,
                        x: imageX,
                        y: frameY,
                        width: frameWidth,
                        height: frameHeight,
                        imageSrc: 'img/WHITE.png', // デフォルトの画像ソースを設定
                        type: '',
                        inputs: [
                            {x: imageX, y: frameY + 40},
                            {x: imageX, y: frameY + 80}
                        ],
                        input1: 'A AND B',
                        input2: 'B',
                        output: {x: imageX + frameWidth, y: frameY + 60},
                        outputValue: 0
                    });
                }
            }
            drawImage(); // 初期化時に画像を描画
        };
    }

    //画像を表示
    function drawImage() {
        componentFrames.forEach(frame => {
            const image = new Image();
            image.src = frame.imageSrc || 'img/WHITE.png';
            image.onload = function() {
                ctx.clearRect(frame.x, frame.y, frame.width, frame.height);
                ctx.drawImage(image, frame.x, frame.y, frame.width, frame.height);
                drawFramePoints(frame); // ここで各フレームにポイントを描画
            };
        });
    }

    function drawFramePoints(frame) {
        ctx.fillStyle = 'black';
        frame.inputs.forEach(input => {
            ctx.beginPath();
            ctx.arc(input.x, input.y, 6, 0, 2 * Math.PI);
            ctx.fill();
        });
        ctx.beginPath();
        ctx.arc(frame.output.x, frame.output.y, 6, 0, 2 * Math.PI);
        ctx.fill();
    }

    function drawLEDs() {
        ctx.font = '20px Arial';

        // LED1
        const led1Pos = { x: 1000, y: 150 };
        ctx.fillStyle = 'black';
        ctx.fillText('LED1', led1Pos.x, led1Pos.y - 20);
        ctx.beginPath();
        ctx.arc(led1Pos.x + 40, led1Pos.y - 10, 10, 0, 2 * Math.PI); // 半径10の円を描く
        ctx.fillStyle = 'gray';
        ctx.fill();

        // LED2
        const led2Pos = { x: 1000, y: 350 };
        ctx.fillStyle = 'black';
        ctx.fillText('LED2', led2Pos.x, led2Pos.y - 20);
        ctx.beginPath();
        ctx.arc(led2Pos.x + 40, led2Pos.y - 10, 10, 0, 2 * Math.PI); // 半径10の円を描く
        ctx.fillStyle = 'gray';
        ctx.fill();

        // LED3
        const led3Pos = { x: 1000, y: 550 };
        ctx.fillStyle = 'black';
        ctx.fillText('LED3', led3Pos.x, led3Pos.y - 20);
        ctx.beginPath();
        ctx.arc(led3Pos.x + 40, led3Pos.y - 10, 10, 0, 2 * Math.PI); // 半径10の円を描く
        ctx.fillStyle = 'gray';
        ctx.fill();
    }

    // クリック検出
    canvas.addEventListener('click', function(event) {
        if (clickTimeout) {
            clearTimeout(clickTimeout);
            clickTimeout = null;
        }

        clickTimeout = setTimeout(function() {
            const rect = canvas.getBoundingClientRect();
            const x = Math.round((event.clientX - rect.left) / 20) * 20;
            const y = Math.round((event.clientY - rect.top) / 20) * 20;

            // 指定された条件に一致する場合は描画しない
            if ((x + 80) % 160 == 0 && (y + 40) % 160 == 0) {
                return;
            }

            if (newLine) {
                if (currentLine.length > 0) {
                    allLines.push([...currentLine]);
                }
                currentLine = [];
                newLine = false;
            }

            if (!isPointInComponentFrame(x, y) && (currentLine.length === 0 || !isLineIntersectingComponent(currentLine[currentLine.length - 1], { x, y }))) {
                if(currentLine.length > 0) judgeInput(currentLine[currentLine.length - 1], { x, y });
                currentLine.push({ x, y });
                drawPolyline();
            }
        }, 250); // ダブルクリックは250ms以内
    });

    // ダブルクリック検出
    canvas.addEventListener('dblclick', function(event) {
        if (clickTimeout) {
            clearTimeout(clickTimeout);
            clickTimeout = null;
        }

        const rect = canvas.getBoundingClientRect();
        const x = Math.round((event.clientX - rect.left) / 20) * 20;
        const y = Math.round((event.clientY - rect.top) / 20) * 20;

        let lineToRemove = -1;
        for (let i = 0; i < allLines.length; i++) {
            if (isPointOnPolyline(x, y, allLines[i])) {
                lineToRemove = i;
                break;
            }
        }

        if (lineToRemove !== -1) {
            allLines.splice(lineToRemove, 1);
            drawPolyline();
        }

        // ライン上のダブルクリックでライン消去
        if (isPointOnPolyline(x, y, currentLine)) {
            currentLine = [];
            drawPolyline();
        }
    });

    // 別の配線ボタンの検出
    newWireButton.addEventListener('click', function() {
        if (currentLine.length > 0) {
            allLines.push([...currentLine]);
            currentLine = [];
        }
        newLine = true;
    });

    // 枠内か検出
    function isPointInComponentFrame(x, y) {
        for (const frame of componentFrames) {
            if (x >= frame.x && x <= frame.x + frame.width && y >= frame.y && y <= frame.y + frame.height) {
                return true;
            }
        }
        return false;
    }

    // 線が枠と交差しているか検出
    function isLineIntersectingComponent(p1, p2) {
        for (const frame of componentFrames) {
            if (isLineIntersectingRect(p1, p2, frame)) {
                // 始点と終点が枠の左側または右側に触れている場合は描画を許可
                if ((p1.x === frame.x && p2.x === frame.x + frame.width) ||
                    (p1.x === frame.x + frame.width && p2.x === frame.x) ||
                    (p1.y === frame.y && p2.y === frame.y + frame.height) ||
                    (p1.y === frame.y + frame.height && p2.y === frame.y)) {
                    continue;
                }
                return true;
            }
        }
        return false;
    }

    // 線が矩形と交差しているか検出
    function isLineIntersectingRect(p1, p2, rect) {
        const { x: x1, y: y1 } = p1;
        const { x: x2, y: y2 } = p2;
        const { x: rx, y: ry, width: rw, height: rh } = rect;

        return (
            isLineIntersectingLine(x1, y1, x2, y2, rx, ry, rx + rw, ry) ||
            isLineIntersectingLine(x1, y1, x2, y2, rx, ry, rx, ry + rh) ||
            isLineIntersectingLine(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh) ||
            isLineIntersectingLine(x1, y1, x2, y2, rx, ry + rh, rx + rw, ry + rh)
        );
    }

    // 二つの線分が交差しているか検出
    function isLineIntersectingLine(x1, y1, x2, y2, x3, y3, x4, y4) {
        const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
        if (denom === 0) return false;

        const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
        const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

        return (ua >= 0 && ua <= 1) && (ub >= 0 && ub <= 1);
    }

    // 折れ線がクリック位置にあると検出
    function isPointOnPolyline(x, y, points) {
        const tolerance = 10;
        for (let i = 0; i < points.length - 1; i++) {
            if (isPointNearLine(x, y, points[i], points[i + 1], tolerance)) {
                return true;
            }
        }
        return false;
    }

    // 線に近いか検出
    function isPointNearLine(px, py, p1, p2, tolerance) {
        const { x: x1, y: y1 } = p1;
        const { x: x2, y: y2 } = p2;
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        const param = dot / len_sq;

        let xx, yy;

        if (param < 0 || (x1 === x2 && y1 === y2)) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        const dx = px - xx;
        const dy = py - yy;
        return (dx * dx + dy * dy) <= tolerance * tolerance;
    }

    // 入力判定(どこから入力されるか)
    function judgeInput(p1, p2) {
        const { x: x1, y: y1 } = p1;
        const { x: x2, y: y2 } = p2;

        if(x1 == 80 && y1 == 140) Line.s = "A"; //A: 80 140
        else if(x1 == 80 && y1 == 340) Line.s = "B"; //B: 80 340
        else if(x1 == 80 && y1 == 540) Line.s = "C"; //C: 80 540

        let ele = 0;
        for (let i = 16; i <= 46; i += 20) {
            for (let j = 10; j < 34; j += 12) {
                ele++;
                if(x2 == i * 20 && y2 == j * 20) Line.e = ele;
                if(x2 == i * 20 && y2 == (j + 2) * 20) Line.e = ele;
            }
        }

        console.log("始点: " + Line.s + " 終点: " + Line.e);
    }

    //真理値表作成関数
    function generateTruthTable() {
        const selectedPartId = document.getElementById('partSelector').value;
        console.log('Selected Part ID:', selectedPartId); // デバッグ用
    
        const selectedPart = componentFrames.find(frame => frame.id === selectedPartId);
        if (!selectedPart) {
            alert('選択されたパーツが見つかりません');
            return;
        }
    
        console.log('Selected Part:', selectedPart); // デバッグ用
    
        let expression = selectedPart.outputValue;
        console.log('Initial Expression:', expression); // デバッグ用
        
        const usedVariables = ['A', 'B', 'C'].filter(variable => {
            const regex = new RegExp(`\\b${variable}\\b`);
            return regex.test(expression);
        });
    
        console.log('Used Variables:', usedVariables); // デバッグ用
    
        const combinations = generateCombinations(usedVariables.length);
    
        const operators = {
            'AND': '&&',
            'OR': '||',
            'XOR': '!=',  // 一時的なプレースホルダー
            'XNOR': '==', // 一時的なプレースホルダー
            'NOT': '!'
        };
    
        for (let op in operators) {
            let regex = new RegExp(`\\b${op}\\b`, 'g');
            expression = expression.replace(regex, operators[op]);
        }
    
        console.log('Evaluated Expression:', expression); // デバッグ用
    
        let table = '<table><tr>';
        usedVariables.forEach(variable => {
            table += `<th>${variable}</th>`;
        });
        table += `<th>${selectedPartId} (${selectedPart.outputValue})</th></tr>`;
    
        combinations.forEach(combination => {
            let context = {};
            usedVariables.forEach((variable, index) => {
                context[variable] = combination[index] ? 1 : 0;
            });
    
            let evalExpression = expression;
            for (let variable in context) {
                let regex = new RegExp(`\\b${variable}\\b`, 'g');
                evalExpression = evalExpression.replace(regex, context[variable]);
            }
    
            let result;
            try {
                result = eval(evalExpression) ? 1 : 0;
            } catch (error) {
                console.error('Evaluation Error:', error); // デバッグ用
                result = 'error';
            }
    
            table += '<tr>';
            usedVariables.forEach(variable => {
                table += `<td>${context[variable]}</td>`;
            });
            table += `<td>${result}</td></tr>`;
        });
    
        table += '</table>';
        document.getElementById('truthTable').innerHTML = table;
        console.log('Truth Table Generated'); // デバッグ用
    }
    
    function generateCombinations(n) {
        let combinations = [];
        for (let i = 0; i < (1 << n); i++) {
            let combination = [];
            for (let j = 0; j < n; j++) {
                combination.push(!!(i & (1 << j)));
            }
            combinations.push(combination);
        }
        return combinations;
    }
    
    

    // 一連の配線を描く
    function drawPolyline() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid();
        drawImage();

        ctx.strokeStyle = 'red';
        allLines.forEach(line => {
            ctx.beginPath();
            ctx.moveTo(line[0].x, line[0].y);
            for (let i = 1; i < line.length; i++) {
                ctx.lineTo(line[i].x, line[i].y);
            }
            ctx.stroke();
        });

        if (currentLine.length > 1) {
            ctx.beginPath();
            ctx.moveTo(currentLine[0].x, currentLine[0].y);
            for (let i = 1; i < currentLine.length; i++) {
                ctx.lineTo(currentLine[i].x, currentLine[i].y);
            }
            ctx.stroke();
        }

        drawInputs();
        drawLEDs();
    }

    //出力を計算
    componentFrames.forEach(frame => calculateOutput(frame));
    // 格子を描く
    drawGrid();
    //最初に画像を表示
    initializeComponentFrames();
    //入力を描く
    drawInputs();
    //出力用のLEDを描く
    drawLEDs();