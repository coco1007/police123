import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const examId = new ObjectId('682203b8758e31eab41f1cbd');

const questions = [
  {
    type: 'ox',
    text: '동승자가 도주자에게 최초PM 2회를 찍은 상태이다. 쫓아가서 운전자가 PM를 1회 찍었다. 경찰측에서 총기 발포가 가능한가?',
    points: 10
  },
  {
    type: 'ox',
    text: '불법 주정차에 단속 기준은 5분이며, 도로교통법 집행이 가능하다.',
    points: 10
  },
  {
    type: 'multiple',
    text: '제 3장 경찰기관 봉금에 관한 규정 중 초과근무 수당 지급 제외 대상자 에 대한 항목 중 틀린것은?',
    options: [
      '뇌물 수수 혐의 이력자',
      '전일 1회 이상 출근한 이력이 없는 경우',
      '내부경고 2회 누적자',
      '피크타임(23:00 ~) 이후 출근자'
    ],
    points: 10
  },
  {
    type: 'multiple',
    text: '조직과 도주RP중 양측이 총기를 발포하여 즉흥으로 전환됬을때 3블럭 이상으로 범위를 벗어나면 안된다 그러면 시민은 몇블럭 까지 가능한가?',
    options: [
      '2블럭',
      '3블럭',
      '5블럭',
      '전체'
    ],
    points: 10
  },
  {
    type: 'multiple',
    text: '영장 RP의 경찰이 참여할 수 있는 최대 인원 수를 고르시오',
    options: [
      '강도측 +1',
      '강도측 +2',
      '강도측 +3',
      '출근 중인 경찰 공무원 전부'
    ],
    points: 10
  },
  {
    type: 'multiple',
    text: '특공대 메뉴얼 무전 수칙 중 특공대가 아닌 인원이 마이크를 사용할 수 있을 때의 조건은 알맞지 않는 것을 고르시오.',
    options: [
      '지휘권자의 지시에 따른 진입대기가 준비 되었을 때',
      '본인이 다운 되었을 때',
      '부여 받은 위치의 대상을 제압 하였을 때',
      '내가 현재 어디 위치에 있는지 알려줄 때'
    ],
    points: 10
  },
  {
    type: 'essay',
    text: '본인은 교통사고 현장을 목격했다. A와 B는 서로 누구의 과실이 큰지 의견이 대립되고 있다. 경찰의 알맞는 행동을 쓰시오.',
    points: 10
  },
  {
    type: 'essay',
    text: '도주 상황이 발생했을시, 운전자는 도주에 성공, 동승자는 제압하여 죽었을 때 어떻게 대처해야하는지 서술하시오',
    points: 10
  },
  {
    type: 'essay',
    text: '경찰서 1차와 2차 털이시 사용 가능한 스나이퍼 갯수, 샷건 갯수를 서술하시오',
    points: 10
  },
  {
    type: 'essay',
    text: '공무원 합동 RP는 어떤 것이 있는지 모두 서술하시오.',
    points: 10
  }
];

async function updateExam() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }

  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db();
  const exams = db.collection('exams');

  try {
    const result = await exams.updateOne(
      { _id: examId },
      {
        $set: {
          questions,
          totalPoints: questions.reduce((sum, q) => sum + q.points, 0)
        }
      }
    );

    if (result.matchedCount === 0) {
      console.error('시험을 찾을 수 없습니다.');
    } else {
      console.log('시험이 성공적으로 업데이트되었습니다.');
    }
  } catch (error) {
    console.error('Error updating exam:', error);
  } finally {
    await client.close();
  }
}

updateExam(); 