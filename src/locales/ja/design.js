export default {
    // List/Table columns
    list: {
        columns: {
            recordId: 'Record ID',
            smiles: 'SMILES',
            modelName: 'モデル名',
            totalPositive: 'Total Positive',
            temp25: '25°C Positive',
            temp45: '45°C Positive',
            created: '作成日時',
            actions: 'アクション'
        }   
    },
    // Create page
    create: {
        title: '新規デザイン'
    },
    // Train page
    train: {
        title: '新規モデルトレーニング',
        back: '戻る',
        startTraining: 'トレーニング開始',
        submitting: '送信中...',
        success: 'モデルトレーニングが正常に開始されました！',
        errors: {
            modelNameRequired: 'モデル名を入力してください',
            baseModelRequired: 'ベースモデルを選択してください',
            fileRequired: 'トレーニングデータセットをアップロードしてください',
            fileFormat: 'サポートされていないファイル形式',
            duplicateFiles: '一部の重複ファイルがスキップされました',
            unknown: 'トレーニングの開始に失敗しました'
        },
        instruction: {
            title: "MU-in-Box 設計機能の説明",
            functionality: {
                title: "1. 機能説明",
                desc: "MU-in-Box には、主に 2 つの機能があります。",
                train: {
                    title: "1.1 モデルのトレーニングと評価",
                    input: "入力：「Customer table template for model tuning.xlsx」",
                    output: "出力：トレーニング済みモデルと評価指標結果",
                    metrics1: "CR、CL タスクの評価指標：RMSE (Root Mean Square Error) および R² (Coefficient of Determination)",
                    metrics2: "CE タスクの評価指標：F1 score および AUC (area under curve)"
                },
                predict: {
                    title: "1.2 性能予測",
                    input: "入力：新しい添加剤の SMILES",
                    output: "出力：新しい添加剤による、ベンチマーク電解液に対する性能変化の予測結果",
                    note: "ユーザーはデータを入力して、モデルのトレーニングや予測を独自に行うことができます。"
                }
            },
            structure: {
                title: "2. 表の構造",
                p1: "パート 1：セル情報（カソード / アノード / 電解液コード）",
                p2: "パート 2：溶媒",
                p3: "パート 3：リチウム塩",
                p4: "パート 4：添加剤",
                p5: "パート 5：セル性能"
            },
            filling: {
                title: "3. 表の入力説明",
                template: {
                    title: "3.1 データテンプレート要件 — 「Customer table template for model tuning.xlsx」",
                    row1: "テンプレートの最初の 2 行は変更しないでください。",
                    row2: "列を追加または削除しないでください。"
                },
                requirements: {
                    title: "3.2 データ入力要件",
                    item1: "表の 3 行目はベンチマーク電解液で、すべてのタスク値は 1 です。その他の電解液の値は、ベンチマーク電解液に対する相対比率です。",
                    item2: "各電解液について、少なくとも 1 つのタスク値が空でないことを確認してください。",
                    item3: "各電解液の配合の合計が 100% になるようにしてください。"
                }
            },
            notes: {
                title: "4. 各パートの入力上の注意",
                p1: {
                    title: "パート 1：セル情報",
                    item1: "すべての項目のカソードとアノードの種類が一致していることを確認してください。",
                    item2: "電解液コードのみ変更可能です。"
                },
                p2: {
                    title: "パート 2：溶媒",
                    item1: "各溶媒の SMILES と wt% を入力してください（最大 Solvent 5 まで）。",
                    item2: "すべての SMILES が有効であることを確認してください。",
                    item3: "ベンチマーク電解液には、少なくとも 3 つの溶媒を含める必要があります。"
                },
                p3: {
                    title: "パート 3：リチウム塩",
                    item1: "各リチウム塩の SMILES と wt% を入力してください（最大 Salt 3 まで）。",
                    item2: "SMILES が有効であることを確認してください。"
                },
                p4: {
                    title: "パート 4：添加剤",
                    item1: "各添加剤の SMILES と wt% を入力してください（最大 Additive 6 まで）。",
                    item2: "ベンチマーク電解液の添加剤数は 3 つを超えてはなりません。"
                },
                p5: {
                    title: "パート 5：セル性能データ",
                    item1: "サイクル寿命（25°C）：25°C、1C-1C サイクル条件下で、バッテリー容量が 80% に低下するまでのサイクル数。",
                    item2: "平均クーロン効率（25°C）：25°C、1C-1C サイクル条件下で、バッテリー容量が 80% に低下するまでの各サイクルのクーロン効率の平均値。",
                    item3: "5C 放電エネルギー保持率（25°C）：25°C 条件下で、5C レートで放電した場合のエネルギー保持率。",
                    item4: "サイクル寿命（45°C）：45°C、1C-1C サイクル条件下で、バッテリー容量が 80% に低下するまでのサイクル数。",
                    item5: "平均クーロン効率（45°C）：45°C、1C-1C サイクル条件下で、バッテリー容量が 80% に低下するまでの各サイクルのクーロン効率の平均値。",
                    note1: "任意の 1 つの性能データを使用してモデルをトレーニングできます。",
                    note2: "同一の配合が複数のセル（例：100、120、130）に対応する場合、同じセル内に半角カンマで区切って入力してください：100,120,130",
                    note3: "セルの書式設定が正しいことを確認してください。"
                }
            },
            tips: {
                title: "5. その他のヒント",
                item1: "5.1 重量チェック列を使用して、配合の合計が 100 wt% になるか確認できます。"
            }
        },
        step1: {
            title: 'モデル情報',
            name: 'モデル名',
            namePlaceholder: 'モデル名を入力',
            remarks: '備考（オプション）',
            remarksPlaceholder: '追加のメモや備考を入力'
        },
        step2: {
            title: 'セル仕様',
            cathode: 'カソード',
            cathodePlaceholder: 'Polycrystal NCM811, 4 mAh/cm²',
            anode: 'アノード',
            anodePlaceholder: '12% SiC + Graphite',
            benchmarkElectrolyte: 'ベンチマーク電解液',
            benchmarkElectrolytePlaceholder: 'Solvent EC/EMC/DEC (2:3:2) + Salt 1M LiPF6/LiFSI + Additive VC/LiDFP',
            cellDesign: 'セル設計',
            cellDesignPlaceholder: '4/5 layer pouch cell, 1.07 NP ratio, 1 Ah capacity'
        },
        step3: {
            title: 'ベースモデル',
            loading: 'モデル読み込み中...',
            noModels: '利用可能なベースモデルがありません'
        },
        step4: {
            title: 'トレーニングデータセット',
            upload: 'データセットをアップロード',
            dragDrop: 'ここにファイルをドラッグアンドドロップ、またはクリックして参照',
            formats: 'サポート形式: CSV, XLSX（最大 50MB）',
            dragDropMultiple: 'ここにファイルをドラッグアンドドロップ、またはクリックして参照',
            formatsMultiple: 'サポート形式：XLSX のみ',
            chooseFile: 'ファイルを選択',
            chooseFiles: 'ファイルを選択',
            removeFile: 'ファイルを削除',
            downloadSample: 'サンプルをダウンロード'
        }
    },
    // Introduction
    introduction: {
        overview: '"Design" は、新しい電解質分子がセル性能にどのような影響を与える可能性があるかについての半定量的な参考情報を提供します。',
        modelDescription: 'Design 機能の基盤は、SES 社内のセルテストデータセットで学習されたデータ駆動型 AI モデルです。すべてのデータは一貫したテスト環境とベンチマーク条件下で生成されています。これにより高品質なデータが確保され、高い予測精度を達成できます。特定のシステムやテスト条件での性能をさらに向上させるため、お客様は独自のデータを使用してモデルを微調整または再トレーニングすることができます。',
        predictionProcess: '予測時、モデルはベンチマークセルの性能と、同じ設計でユーザーが指定した新しい電解質添加剤を組み込んだ仮想セルの性能を比較します。報告されるパーセンテージ変化は、SES 社内のテストプラットフォームと条件から導出されています。',
        example: '例えば、分子 O=C1OC(C2COS(=O)(=O)O2)C(C2COS(=O)(=O)O2)O1 を評価する場合、MU データベースに存在すればシステムは分子情報を表示します。その後、予測結果が表示され、矢印は影響の方向を示し、パーセンテージは SES 社内テストプラットフォームに基づいています。この例では、モデルは新しい電解質添加剤が室温サイクル寿命とクーロン効率にプラスの影響を与えるが、より安定した SEI の形成により、レート性能がわずかに低下する可能性があると予測しています。',
        // Figure 1
        figure1Label: '図 1.',
        figure1Alt: '任意の分子の SMILES を入力',
        figure1Caption: '任意の分子の SMILES を入力',
        // Figure 2
        figure2Label: '図 2.',
        figure2Alt: '入力された分子が MU データベースに存在する場合、分子情報が表示されます',
        figure2Caption: '入力された分子が MU データベースに存在する場合、分子情報が表示されます',
        // Figure 3
        figure3Label: '図 3.',
        figure3Alt: '分子がセル性能に与える影響の半定量的予測',
        figure3Caption: '分子がセル性能に与える影響の半定量的予測。矢印はプラスまたはマイナスの影響を示し、パーセンテージは各条件下での SES テストプラットフォームから導出されています。',
        // レガシーキー
        figureAlt: 'Design モデルによる分子のセル性能予測の例',
        figureCaption: '図. Design モデルによる分子のセル性能予測の例',
        accuracy: '社内検証に基づくと、現在のモデルは約 85% の方向精度を達成しており、定義された条件下で以前に見たことのない約 10 個の分子のうち 8 個の影響を正しく判断できることを意味します。',
        supportedSystems: '現在の Design モジュールは NCM811 – 12% Si/グラファイト – カーボネート電解質システムをサポートしており、室温サイクル、45 °C サイクル、室温レート性能の予測が可能です。追加のセルシステムとテスト条件は今後のアップデートで組み込まれる予定です。',
        customization: 'セル化学、セル設計、アプリケーション条件は多様であるため、お客様は独自のデータを使用してモデルを微調整または再トレーニングし、特定のシステムに対して最高の予測精度を達成することができます。この機能は、100% のデータプライバシーとゼロデータ漏洩を保証するオンプレミス展開の MU Box に含まれています。',
        automation: 'データ増強、モデルトレーニング、モデル評価は完全に自動化されています。お客様は、異なる添加剤分子を含むデータセットを収集してアップロードするだけです。詳細な手順は「Train」機能で確認できます。'
    },
    // Model Detail
    modelDetail: {
        title: "モデル情報",
        modelId: "モデルID：",
        back: "戻る",
        onlineModel: "モデルをデプロイ",
        offlineModel: "モデルをアンデプロイ",
        deploying: "デプロイ中...",
        undeploying: "アンデプロイ中...",
        creator: "作成者：",
        status: "ステータス：",
        statusOnline: "オンライン",
        statusTrained: "トレーニング済み",
        statusOffline: "オフライン",
        statusTraining: "トレーニング中",
        statusFail: "失敗",
        created: "作成日時：",
        remarks: "備考：",
        baseModel: "ベースモデル",
        trainingDataset: "トレーニングデータセット",
        datasetName: "データセット名：",
        fileSize: "ファイルサイズ：",
        totalSamples: "総サンプル数：",
        ratio: "トレーニング-テスト比：",
        trainingResults: "トレーニング結果",
        trainingFiles: "トレーニングデータセット",
        trainingMetrics: "トレーニング結果",
        accuracy: "精度",
        loss: "損失",
        epochs: "エポック数",
        trainingTime: "トレーニング時間",
        validationScore: "検証スコア",
        baseRMSE: "ベースモデル RMSE",
        baseR2: "ベースモデル R²",
        trainRMSE: "新モデル RMSE",
        trainR2: "新モデル R²",
        rmse: "RMSE",
        r2: "R²",
        baseModelLabel: "ベースモデル",
        newModelLabel: "新モデル",
        designRecords: "デザイン記録",
        recordId: "記録ID",
        smiles: "SMILES",
        temp25Count: "25°C陽性",
        temp45Count: "45°C陽性",
        actions: "操作",
        viewDetails: "詳細を表示",
        loadingText: "読み込み中...",
        error: "エラー",
        noFiles: "トレーニングファイルがありません",
        noMetrics: "トレーニング指標がありません",
        beforeTraining: "トレーニング前",
        afterTraining: "トレーニング後",
        downloadingLog: "ダウンロード中...",
        downloadTrainLog: "トレーニングログをダウンロード",
        confirmDeploy: "このモデルをデプロイしてもよろしいですか？",
        confirmUndeploy: "このモデルをアンデプロイしてもよろしいですか？",
        deploySuccess: "モデルが正常にデプロイされました！",
        undeploySuccess: "モデルが正常にアンデプロイされました！",
        errors: {
            noModelId: "モデルIDが提供されていません",
            loadFailed: "モデル詳細の読み込みに失敗しました",
            deployFailed: "モデルのデプロイに失敗しました",
            undeployFailed: "モデルのアンデプロイに失敗しました",
            cannotDeployDemo: "デモモデルはデプロイできません",
            cannotUndeployDemo: "デモモデルはアンデプロイできません",
            downloadLogFailed: "トレーニングログのダウンロードに失敗しました"
        }
    },
    // Record Detail
    record: {
        title: "記録詳細",
        missingId: "記録IDパラメータが不足しています",
        fetchError: "記録詳細の取得に失敗しました",
        loading: "読み込み中...",
        createdAt: "作成日時",
        cellChemistry: "設計設定",
        cellChemistryLabel: "セル化学",
        modelSelect: "モデル選択",
        noModel: "モデル情報なし",
        weightPercentage: "重量パーセンテージ"
    }
};
