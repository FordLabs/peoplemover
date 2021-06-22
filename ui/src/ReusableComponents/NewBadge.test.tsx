import {calculateGradient} from "./NewBadge";
import moment, {Moment} from "moment";


describe('NewBadge', () => {
    
    describe('calculateGradient()', () => {
        it('should return empty string if newPersonDate is today',  () =>  {

            const newPersonDate: Date = moment().toDate();

            expect(calculateGradient(newPersonDate)).toBe('');
        });


        it('should return stage2 string if today is 8 days ahead of newPersonDate',  () =>  {
            const newPersonDate: Date = moment().add(8, 'days').toDate()

            expect(calculateGradient(newPersonDate)).toBe('stage2');
        });
    });



});
